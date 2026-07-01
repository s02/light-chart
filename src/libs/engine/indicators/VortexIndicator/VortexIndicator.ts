import { LineSeries, LineStyle } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'

const VI_SCHEMA = {
  text: [],
  inputs: [{ type: 'number', key: 'vi-length', default: 14, min: 2, max: 9999 }],
  style: [
    { type: 'color', key: 'vi-viPlus', default: 'rgb(41 98 255)' },
    { type: 'color', key: 'vi-viMinus', default: 'rgb(239 83 80)' }
  ]
} as const satisfies StudySchema

type VIParams = InferStudyValues<typeof VI_SCHEMA.inputs> &
  InferStudyValues<typeof VI_SCHEMA.style> &
  InferStudyValues<typeof VI_SCHEMA.text>

export class VortexIndicator extends AbstractIndicator implements Indicator {
  static readonly ikey = 'vi' as const

  #chart: IChartApi
  #params: VIParams

  #series: {
    viPlus: ISeriesApi<SeriesType>
    viMinus: ISeriesApi<SeriesType>
    midLine: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(VI_SCHEMA.inputs, VI_SCHEMA.style, VI_SCHEMA.text, options?.params)

    this.#series = {
      viPlus: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['vi-viPlus'], priceLineVisible: false },
        this.paneIndex
      ),
      viMinus: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['vi-viMinus'], priceLineVisible: false },
        this.paneIndex
      ),
      midLine: this.#chart.addSeries(
        LineSeries,
        {
          color: '#787B86',
          lineWidth: 1,
          lineStyle: LineStyle.LargeDashed,
          crosshairMarkerVisible: false,
          lastValueVisible: false,
          priceLineVisible: false
        },
        this.paneIndex
      )
    }
  }

  getSchema() {
    return {
      ikey: VortexIndicator.ikey,
      schema: VI_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(VI_SCHEMA.inputs, VI_SCHEMA.style, VI_SCHEMA.text, params)
    this.#series.viPlus.applyOptions({ color: this.#params['vi-viPlus'] })
    this.#series.viMinus.applyOptions({ color: this.#params['vi-viMinus'] })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'VI', paneIndex: this.paneIndex, data: [] }
    legend.data.push({ value: this.#params['vi-length'].toString(), color: 'rgb(140, 140, 140)' })
    const entries = [
      [this.#series.viPlus, this.#params['vi-viPlus']],
      [this.#series.viMinus, this.#params['vi-viMinus']]
    ] as const
    for (const [series, color] of entries) {
      const data = seriesData.get(series)
      if (data) legend.data.push({ value: formatPrice((data as LineData<Time>).value), color })
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    const { viPlus, viMinus } = this.#calculate(data)
    const firstTime = data[0].time
    const lastTime = data[data.length - 1].time

    this.#series.midLine.setData([
      { time: firstTime, value: 1 },
      { time: lastTime, value: 1 }
    ])
    this.#series.viPlus.setData(viPlus)
    this.#series.viMinus.setData(viMinus)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.viPlus)
    this.#chart.removeSeries(this.#series.viMinus)
    this.#chart.removeSeries(this.#series.midLine)
  }

  #calculate(bars: ChartBar[]) {
    const len = this.#params['vi-length']
    const n = bars.length
    const tr = new Array<number>(n).fill(NaN)
    const vmPlus = new Array<number>(n).fill(NaN)
    const vmMinus = new Array<number>(n).fill(NaN)

    for (let i = 1; i < n; i++) {
      const { high, low } = bars[i]
      const prevClose = bars[i - 1].close
      const prevHigh = bars[i - 1].high
      const prevLow = bars[i - 1].low
      tr[i] = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose))
      vmPlus[i] = Math.abs(high - prevLow)
      vmMinus[i] = Math.abs(low - prevHigh)
    }

    const viPlusArr = new Array<number>(n).fill(NaN)
    const viMinusArr = new Array<number>(n).fill(NaN)

    for (let i = len; i < n; i++) {
      let sumTR = 0,
        sumVMPlus = 0,
        sumVMMinus = 0
      for (let j = i - len + 1; j <= i; j++) {
        sumTR += tr[j]
        sumVMPlus += vmPlus[j]
        sumVMMinus += vmMinus[j]
      }
      if (sumTR !== 0) {
        viPlusArr[i] = sumVMPlus / sumTR
        viMinusArr[i] = sumVMMinus / sumTR
      }
    }

    const toBar = (value: number, i: number) => ({ time: bars[i].time, value })

    return {
      viPlus: this.filter(viPlusArr.map(toBar)),
      viMinus: this.filter(viMinusArr.map(toBar))
    }
  }
}

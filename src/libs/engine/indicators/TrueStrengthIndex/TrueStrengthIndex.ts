import { LineSeries, LineStyle } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { getSourceSeries, ta } from 'oakscriptjs'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'

const TSI_SCHEMA = {
  inputs: [
    { type: 'number', key: 'long', default: 25, min: 1 },
    { type: 'number', key: 'short', default: 13, min: 1 },
    { type: 'number', key: 'signal', default: 13, min: 1 }
  ],
  style: [
    { type: 'color', key: 'tsiLine', default: 'rgb(41 98 255)' },
    { type: 'color', key: 'signalLine', default: 'rgb(255 109 0)' }
  ]
} as const satisfies StudySchema

type TSIParams = InferStudyValues<typeof TSI_SCHEMA.inputs> & InferStudyValues<typeof TSI_SCHEMA.style>

export class TrueStrengthIndex extends AbstractIndicator implements Indicator {
  static readonly ikey = 'true-si' as const

  #chart: IChartApi
  #params: TSIParams

  #series: {
    tsi: ISeriesApi<SeriesType>
    signal: ISeriesApi<SeriesType>
    zeroLine: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(TSI_SCHEMA.inputs, TSI_SCHEMA.style, options?.params)

    this.#series = {
      tsi: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.tsiLine, priceLineVisible: false },
        this.paneIndex
      ),
      signal: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.signalLine, priceLineVisible: false },
        this.paneIndex
      ),
      zeroLine: this.#chart.addSeries(
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
      ikey: TSI.ikey,
      schema: TSI_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(TSI_SCHEMA.inputs, TSI_SCHEMA.style, params)
    this.#series.tsi.applyOptions({ color: this.#params.tsiLine })
    this.#series.signal.applyOptions({ color: this.#params.signalLine })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'True Strength Index', paneIndex: this.paneIndex, data: [] }
    const entries = [
      [this.#series.tsi, this.#params.tsiLine],
      [this.#series.signal, this.#params.signalLine]
    ] as const
    for (const [series, color] of entries) {
      const data = seriesData.get(series)
      if (data) legend.data.push({ value: formatPrice((data as LineData<Time>).value), color })
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    const { tsiData, signalData } = this.#calculate(data)
    const firstTime = data[0].time
    const lastTime = data[data.length - 1].time

    this.#series.zeroLine.setData([
      { time: firstTime, value: 0 },
      { time: lastTime, value: 0 }
    ])
    this.#series.tsi.setData(tsiData)
    this.#series.signal.setData(signalData)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.tsi)
    this.#chart.removeSeries(this.#series.signal)
    this.#chart.removeSeries(this.#series.zeroLine)
  }

  #calculate(bars: ChartBar[]) {
    const close = getSourceSeries(bars, 'close')
    const tsiSeries = ta.tsi(close, this.#params.short, this.#params.long)
    const signalSeries = ta.ema(tsiSeries, this.#params.signal)

    const tsiArr = tsiSeries.toArray()
    const signalArr = signalSeries.toArray()

    const toBar = (value: number, i: number) => ({ time: bars[i].time, value: value ?? NaN })

    return {
      tsiData: this.filter(tsiArr.map(toBar)),
      signalData: this.filter(signalArr.map(toBar))
    }
  }
}

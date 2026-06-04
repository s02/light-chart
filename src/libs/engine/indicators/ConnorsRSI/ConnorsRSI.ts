import { BaselineSeries, LineSeries, LineStyle } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { Series, ta } from 'oakscriptjs'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'

// TODO: Перепроверить рассчеты

const CRSI_SCHEMA = {
  inputs: [
    { type: 'number', key: 'lenrsi', default: 3, min: 1 },
    { type: 'number', key: 'lenupdown', default: 2, min: 1 },
    { type: 'number', key: 'lenroc', default: 100, min: 1 }
  ],
  style: [{ type: 'color', key: 'color', default: 'rgb(41 98 255)' }]
} as const satisfies StudySchema

type CRSIParams = InferStudyValues<typeof CRSI_SCHEMA.inputs> & InferStudyValues<typeof CRSI_SCHEMA.style>

export class ConnorsRSI extends AbstractIndicator implements Indicator {
  static readonly ikey = 'crsi' as const

  #chart: IChartApi
  #params: CRSIParams

  #series: {
    crsi: ISeriesApi<SeriesType>
    upperLine: ISeriesApi<SeriesType>
    middleLine: ISeriesApi<SeriesType>
    lowerLine: ISeriesApi<SeriesType>
    fill: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(CRSI_SCHEMA.inputs, CRSI_SCHEMA.style, options?.params)

    this.#series = {
      crsi: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.color, priceLineVisible: false },
        this.paneIndex
      ),
      upperLine: this.#chart.addSeries(
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
      ),
      middleLine: this.#chart.addSeries(
        LineSeries,
        {
          color: '#787B8680',
          lineWidth: 1,
          lineStyle: LineStyle.LargeDashed,
          crosshairMarkerVisible: false,
          lastValueVisible: false,
          priceLineVisible: false
        },
        this.paneIndex
      ),
      lowerLine: this.#chart.addSeries(
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
      ),
      fill: this.#chart.addSeries(
        BaselineSeries,
        {
          baseValue: { type: 'price', price: 30 },
          topFillColor1: 'rgba(41,98,255,0.1)',
          topFillColor2: 'rgba(41,98,255,0.1)',
          bottomFillColor1: 'transparent',
          bottomFillColor2: 'transparent',
          topLineColor: 'transparent',
          bottomLineColor: 'transparent',
          lineVisible: false,
          lastValueVisible: false,
          priceLineVisible: false,
          crosshairMarkerVisible: false
        },
        this.paneIndex
      )
    }
  }

  getSchema() {
    return {
      ikey: ConnorsRSI.ikey,
      schema: CRSI_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(CRSI_SCHEMA.inputs, CRSI_SCHEMA.style, params)
    this.#series.crsi.applyOptions({ color: this.#params.color })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: ConnorsRSI.ikey.toUpperCase(), paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series.crsi)
    if (data) {
      legend.data.push({ value: formatPrice((data as LineData<Time>).value), color: this.#params.color })
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    const crsiData = this.#calculate(data)
    const firstTime = data[0].time
    const lastTime = data[data.length - 1].time

    this.#series.upperLine.setData([
      { time: firstTime, value: 70 },
      { time: lastTime, value: 70 }
    ])
    this.#series.middleLine.setData([
      { time: firstTime, value: 50 },
      { time: lastTime, value: 50 }
    ])
    this.#series.lowerLine.setData([
      { time: firstTime, value: 30 },
      { time: lastTime, value: 30 }
    ])
    this.#series.fill.setData([
      { time: firstTime, value: 70 },
      { time: lastTime, value: 70 }
    ])

    this.#series.crsi.setData(crsiData)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.crsi)
    this.#chart.removeSeries(this.#series.upperLine)
    this.#chart.removeSeries(this.#series.middleLine)
    this.#chart.removeSeries(this.#series.lowerLine)
    this.#chart.removeSeries(this.#series.fill)
  }

  #calculate(bars: ChartBar[]) {
    const close = new Series(bars, (b) => b.close)

    const ud: number[] = [0]
    for (let i = 1; i < bars.length; i++) {
      const s = bars[i].close
      const sPrev = bars[i - 1].close
      if (s === sPrev) {
        ud.push(0)
      } else if (s > sPrev) {
        ud.push(ud[i - 1] <= 0 ? 1 : ud[i - 1] + 1)
      } else {
        ud.push(ud[i - 1] >= 0 ? -1 : ud[i - 1] - 1)
      }
    }

    const udSeries = new Series(bars, (_, i) => ud[i])

    const rsiArr = ta.rsi(close, this.#params.lenrsi).toArray()
    const udRsiArr = ta.rsi(udSeries, this.#params.lenupdown).toArray()
    const prArr = ta.percentrank(ta.roc(close, 1), this.#params.lenroc).toArray()

    const mapped = bars.map((bar, i) => {
      const a = rsiArr[i]
      const b = udRsiArr[i]
      const c = prArr[i]
      const value = a != null && b != null && c != null ? (a + b + c) / 3 : NaN
      return { time: bar.time, value }
    })

    return this.filter(mapped)
  }
}

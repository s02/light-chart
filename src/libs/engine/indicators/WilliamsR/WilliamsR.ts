import { BaselineSeries, LineSeries, LineStyle } from 'lightweight-charts'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { formatPrice } from '@engine/helpers'
import { ta } from 'oakscriptjs'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'

const WPR_SCHEMA = {
  text: [],
  inputs: [{ type: 'number', key: 'wpr-length', default: 14, min: 1, max: 9999 }],
  style: [
    { type: 'color', key: 'wpr-color', default: 'rgb(126 87 194)' },
    { type: 'color', key: 'wpr-fill-color', default: 'rgb(41 98 255 / 10%)' },
    { type: 'number', key: 'wpr-upperLimit', default: -20, min: -99, max: 99 },
    { type: 'number', key: 'wpr-lowerLimit', default: -80, min: -99, max: 99 }
  ]
} as const satisfies StudySchema

type WPRParams = InferStudyValues<typeof WPR_SCHEMA.inputs> &
  InferStudyValues<typeof WPR_SCHEMA.style> &
  InferStudyValues<typeof WPR_SCHEMA.text>

export class WilliamsR extends AbstractIndicator implements Indicator {
  static readonly ikey = 'wpr' as const

  #chart: IChartApi
  #params: WPRParams

  #series: {
    wpr: ISeriesApi<SeriesType>
    upperLine: ISeriesApi<SeriesType>
    lowerLine: ISeriesApi<SeriesType>
    fill: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(WPR_SCHEMA.inputs, WPR_SCHEMA.style, WPR_SCHEMA.text, options?.params)

    const refLineOptions = {
      color: '#787B86',
      lineWidth: 1 as const,
      lineStyle: LineStyle.LargeDashed,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false
    }

    this.#series = {
      wpr: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['wpr-color'], priceLineVisible: false },
        this.paneIndex
      ),
      upperLine: this.#chart.addSeries(LineSeries, refLineOptions, this.paneIndex),
      lowerLine: this.#chart.addSeries(LineSeries, refLineOptions, this.paneIndex),
      fill: this.#chart.addSeries(
        BaselineSeries,
        {
          baseValue: { type: 'price', price: -80 },
          topFillColor1: this.#params['wpr-fill-color'],
          topFillColor2: this.#params['wpr-fill-color'],
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
      ikey: WilliamsR.ikey,
      schema: WPR_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(WPR_SCHEMA.inputs, WPR_SCHEMA.style, WPR_SCHEMA.text, params)
    this.#series.wpr.applyOptions({ color: this.#params['wpr-color'] })
    this.#series.fill.applyOptions({
      topFillColor1: this.#params['wpr-fill-color'],
      topFillColor2: this.#params['wpr-fill-color'],
      baseValue: { type: 'price', price: this.#params['wpr-lowerLimit'] }
    })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: '%R', paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series.wpr)
    legend.data.push({ value: this.#params['wpr-length'].toString(), color: 'rgb(140, 140, 140)' })
    if (data) {
      legend.data.push({ value: formatPrice((data as LineData<Time>).value), color: this.#params['wpr-color'] })
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    const wprData = this.#calculate(data)
    const firstTime = data[0].time
    const lastTime = data[data.length - 1].time

    this.#series.upperLine.setData([
      { time: firstTime, value: this.#params['wpr-upperLimit'] },
      { time: lastTime, value: this.#params['wpr-upperLimit'] }
    ])
    this.#series.lowerLine.setData([
      { time: firstTime, value: this.#params['wpr-lowerLimit'] },
      { time: lastTime, value: this.#params['wpr-lowerLimit'] }
    ])
    this.#series.fill.setData([
      { time: firstTime, value: this.#params['wpr-upperLimit'] },
      { time: lastTime, value: this.#params['wpr-upperLimit'] }
    ])

    this.#series.wpr.setData(wprData)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.wpr)
    this.#chart.removeSeries(this.#series.upperLine)
    this.#chart.removeSeries(this.#series.lowerLine)
    this.#chart.removeSeries(this.#series.fill)
  }

  #calculate(bars: ChartBar[]) {
    const wprValues = ta.wpr(bars, this.#params['wpr-length']).toArray()

    const mapped = wprValues.map((value, i) => ({
      time: bars[i].time,
      value: value ?? NaN
    }))

    return this.filter(mapped)
  }
}

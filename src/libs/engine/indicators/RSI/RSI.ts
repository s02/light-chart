import { BaselineSeries, LineSeries, LineStyle } from 'lightweight-charts'
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

const RSI_SCHEMA = {
  text: [],
  inputs: [{ type: 'number', key: 'rsi-length', default: 14, min: 1, max: 9999 }],
  style: [
    { type: 'color', key: 'rsi-color', default: 'rgb(126 87 194)' },
    { type: 'number', key: 'rsi-upperLimit', default: 70, min: 1, max: 99 },
    { type: 'number', key: 'rsi-middleLimit', default: 50, min: 1, max: 99 },
    { type: 'number', key: 'rsi-lowerLimit', default: 30, min: 1, max: 99 },
    { type: 'color', key: 'rsi-fill-color', default: 'rgb(41 98 255 / 10%)' }
  ]
} as const satisfies StudySchema

type RSIParams = InferStudyValues<typeof RSI_SCHEMA.inputs> &
  InferStudyValues<typeof RSI_SCHEMA.style> &
  InferStudyValues<typeof RSI_SCHEMA.text>

export class RSI extends AbstractIndicator implements Indicator {
  static readonly ikey = 'rsi' as const

  #chart: IChartApi
  #params: RSIParams

  #series: {
    rsi: ISeriesApi<SeriesType>
    upperLine: ISeriesApi<SeriesType>
    middleLine: ISeriesApi<SeriesType>
    lowerLine: ISeriesApi<SeriesType>
    fill: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(RSI_SCHEMA.inputs, RSI_SCHEMA.style, RSI_SCHEMA.text, options?.params)

    this.#series = {
      rsi: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['rsi-color'], priceLineVisible: false },
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
          color: '#787B86',
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
          baseValue: { type: 'price', price: this.#params['rsi-lowerLimit'] },
          topFillColor1: this.#params['rsi-fill-color'],
          topFillColor2: this.#params['rsi-fill-color'],
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
      ikey: RSI.ikey,
      schema: RSI_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(RSI_SCHEMA.inputs, RSI_SCHEMA.style, RSI_SCHEMA.text, params)
    this.#series.rsi.applyOptions({ color: this.#params['rsi-color'] })
    this.#series.fill.applyOptions({
      topFillColor1: this.#params['rsi-fill-color'],
      topFillColor2: this.#params['rsi-fill-color'],
      baseValue: { type: 'price', price: this.#params['rsi-lowerLimit'] }
    })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: RSI.ikey.toUpperCase(), paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series.rsi)

    legend.data.push({ value: this.#params['rsi-length'].toString(), color: 'rgb(140, 140, 140)' })

    if (data) {
      legend.data.push({ value: formatPrice((data as LineData<Time>).value), color: this.#params['rsi-color'] })
    }

    return legend
  }

  protected onData(data: ChartBar[]) {
    const rsiData = this.#calculate(data)

    const firstTime = data[0].time
    const lastTime = data[data.length - 1].time

    this.#series.upperLine.setData([
      { time: firstTime, value: this.#params['rsi-upperLimit'] },
      { time: lastTime, value: this.#params['rsi-upperLimit'] }
    ])

    this.#series.middleLine.setData([
      { time: firstTime, value: this.#params['rsi-middleLimit'] },
      { time: lastTime, value: this.#params['rsi-middleLimit'] }
    ])

    this.#series.lowerLine.setData([
      { time: firstTime, value: this.#params['rsi-lowerLimit'] },
      { time: lastTime, value: this.#params['rsi-lowerLimit'] }
    ])

    this.#series.fill.setData([
      { time: firstTime, value: this.#params['rsi-upperLimit'] },
      { time: lastTime, value: this.#params['rsi-upperLimit'] }
    ])

    this.#series.rsi.setData(rsiData)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.rsi)
    this.#chart.removeSeries(this.#series.upperLine)
    this.#chart.removeSeries(this.#series.middleLine)
    this.#chart.removeSeries(this.#series.lowerLine)
    this.#chart.removeSeries(this.#series.fill)
  }

  #calculate(bars: ChartBar[]) {
    const close = getSourceSeries(bars, 'close')
    const rsiValues = ta.rsi(close, this.#params['rsi-length'])

    const mapped = rsiValues.toArray().map((value, i) => ({
      time: bars[i].time,
      value: value ?? NaN
    }))

    return this.filter(mapped)
  }
}

import { BaselineSeries, LineSeries, LineStyle, LineType } from 'lightweight-charts'
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

const PRICE_PRECISION = 2

const STOCHRSI_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'stochastic-rsi-rsiLength', default: 14, min: 1 },
    { type: 'number', key: 'stochastic-rsi-stochLength', default: 14, min: 1 },
    { type: 'number', key: 'stochastic-rsi-smoothK', default: 3, min: 1 },
    { type: 'number', key: 'stochastic-rsi-smoothD', default: 3, min: 1 }
  ],
  style: [
    {
      type: 'line',
      key: 'stochastic-rsi-kLine',
      default: {
        color: 'rgb(41 98 255)',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        lineType: LineType.Simple
      }
    },
    {
      type: 'line',
      key: 'stochastic-rsi-dLine',
      default: {
        color: 'rgb(255 109 0)',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        lineType: LineType.Simple
      }
    },
    { type: 'color', key: 'stochastic-rsi-fill-color', default: 'rgb(41 98 255 / 10%)' },
    { type: 'number', key: 'stochastic-rsi-upperLimit', default: 80, min: 1, max: 99 },
    {
      type: 'line',
      key: 'stochastic-rsi-upperLimit-line',
      default: {
        color: '#787B86',
        lineWidth: 1,
        lineStyle: LineStyle.LargeDashed,
        lineType: LineType.Simple
      }
    },
    { type: 'number', key: 'stochastic-rsi-lowerLimit', default: 20, min: 1, max: 99 },
    {
      type: 'line',
      key: 'stochastic-rsi-lowerLimit-line',
      default: {
        color: '#787B86',
        lineWidth: 1,
        lineStyle: LineStyle.LargeDashed,
        lineType: LineType.Simple
      }
    }
  ]
} as const satisfies StudySchema

type StochRSIParams = InferStudyValues<typeof STOCHRSI_SCHEMA.inputs> &
  InferStudyValues<typeof STOCHRSI_SCHEMA.style> &
  InferStudyValues<typeof STOCHRSI_SCHEMA.text>

export class StochasticRSI extends AbstractIndicator implements Indicator {
  static readonly ikey = 'stochastic-rsi' as const

  #chart: IChartApi
  #params: StochRSIParams

  #series: {
    k: ISeriesApi<SeriesType>
    d: ISeriesApi<SeriesType>
    upperLine: ISeriesApi<SeriesType>
    lowerLine: ISeriesApi<SeriesType>
    fill: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(
      STOCHRSI_SCHEMA.inputs,
      STOCHRSI_SCHEMA.style,
      STOCHRSI_SCHEMA.text,
      options?.params
    )

    this.#series = {
      k: this.#chart.addSeries(
        LineSeries,
        {
          ...COMMON_SERIES_SETTINGS,
          priceFormat: { ...COMMON_SERIES_SETTINGS.priceFormat, precision: PRICE_PRECISION },
          ...this.#params['stochastic-rsi-kLine'],
          priceLineVisible: false
        },
        this.paneIndex
      ),
      d: this.#chart.addSeries(
        LineSeries,
        {
          ...COMMON_SERIES_SETTINGS,
          priceFormat: { ...COMMON_SERIES_SETTINGS.priceFormat, precision: PRICE_PRECISION },
          ...this.#params['stochastic-rsi-dLine'],
          priceLineVisible: false
        },
        this.paneIndex
      ),
      upperLine: this.#chart.addSeries(
        LineSeries,
        {
          ...this.#params['stochastic-rsi-upperLimit-line'],
          crosshairMarkerVisible: false,
          lastValueVisible: false,
          priceLineVisible: false
        },
        this.paneIndex
      ),
      lowerLine: this.#chart.addSeries(
        LineSeries,
        {
          ...this.#params['stochastic-rsi-lowerLimit-line'],
          crosshairMarkerVisible: false,
          lastValueVisible: false,
          priceLineVisible: false
        },
        this.paneIndex
      ),
      fill: this.#chart.addSeries(
        BaselineSeries,
        {
          baseValue: { type: 'price', price: this.#params['stochastic-rsi-lowerLimit'] },
          topFillColor1: this.#params['stochastic-rsi-fill-color'],
          topFillColor2: this.#params['stochastic-rsi-fill-color'],
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
      ikey: StochasticRSI.ikey,
      schema: STOCHRSI_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(STOCHRSI_SCHEMA.inputs, STOCHRSI_SCHEMA.style, STOCHRSI_SCHEMA.text, params)
    this.#series.k.applyOptions(this.#params['stochastic-rsi-kLine'])
    this.#series.d.applyOptions(this.#params['stochastic-rsi-dLine'])
    this.#series.upperLine.applyOptions(this.#params['stochastic-rsi-upperLimit-line'])
    this.#series.lowerLine.applyOptions(this.#params['stochastic-rsi-lowerLimit-line'])

    this.#series.fill.applyOptions({
      topFillColor1: this.#params['stochastic-rsi-fill-color'],
      topFillColor2: this.#params['stochastic-rsi-fill-color'],
      baseValue: { type: 'price', price: this.#params['stochastic-rsi-lowerLimit'] }
    })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: StochasticRSI.ikey.toUpperCase(), paneIndex: this.paneIndex, data: [] }
    const kData = seriesData.get(this.#series.k)
    const dData = seriesData.get(this.#series.d)

    legend.data.push(
      { value: this.#params['stochastic-rsi-rsiLength'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['stochastic-rsi-stochLength'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['stochastic-rsi-smoothK'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['stochastic-rsi-smoothD'].toString(), color: 'rgb(140, 140, 140)' }
    )

    if (kData && dData) {
      legend.data.push(
        { value: formatPrice((kData as LineData<Time>).value), color: this.#params['stochastic-rsi-kLine'].color },
        { value: formatPrice((dData as LineData<Time>).value), color: this.#params['stochastic-rsi-dLine'].color }
      )
    }

    return legend
  }

  protected onData(data: ChartBar[]) {
    const pp = this.#calculate(data)

    const firstTime = data[0].time
    const lastTime = data[data.length - 1].time

    this.#series.upperLine.setData([
      { time: firstTime, value: this.#params['stochastic-rsi-upperLimit'] },
      { time: lastTime, value: this.#params['stochastic-rsi-upperLimit'] }
    ])

    this.#series.lowerLine.setData([
      { time: firstTime, value: this.#params['stochastic-rsi-lowerLimit'] },
      { time: lastTime, value: this.#params['stochastic-rsi-lowerLimit'] }
    ])

    this.#series.fill.setData([
      { time: firstTime, value: this.#params['stochastic-rsi-upperLimit'] },
      { time: lastTime, value: this.#params['stochastic-rsi-upperLimit'] }
    ])

    this.#series.k.setData(pp.k)
    this.#series.d.setData(pp.d)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.k)
    this.#chart.removeSeries(this.#series.d)
    this.#chart.removeSeries(this.#series.upperLine)
    this.#chart.removeSeries(this.#series.lowerLine)
    this.#chart.removeSeries(this.#series.fill)
  }

  #calculate(bars: ChartBar[]) {
    const close = getSourceSeries(bars, 'close')
    const rsi = ta.rsi(close, this.#params['stochastic-rsi-rsiLength'])

    const stochRSI = ta.stoch(rsi, rsi, rsi, this.#params['stochastic-rsi-stochLength'])
    const k = ta.sma(stochRSI, this.#params['stochastic-rsi-smoothK'])
    const d = ta.sma(k, this.#params['stochastic-rsi-smoothD'])

    const toMapped = (arr: number[]) => arr.map((value, i) => ({ time: bars[i].time, value: value ?? NaN }))

    return {
      k: this.filter(toMapped(k.toArray())),
      d: this.filter(toMapped(d.toArray()))
    }
  }
}

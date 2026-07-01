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

const STOCH_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'stochastic-lengthK', default: 14, min: 1, max: 9999 },
    { type: 'number', key: 'stochastic-smoothK', default: 1, min: 1, max: 9999 },
    { type: 'number', key: 'stochastic-smoothD', default: 3, min: 1, max: 9999 },
    { type: 'number', key: 'stochastic-upperLimit', default: 80, min: 1, max: 99 },
    { type: 'number', key: 'stochastic-lowerLimit', default: 20, min: 1, max: 99 }
  ],
  style: [
    { type: 'color', key: 'stochastic-kLine', default: 'rgb(41 98 255)' },
    { type: 'color', key: 'stochastic-dLine', default: 'rgb(255 109 0)' },
    { type: 'color', key: 'stochastic-fill-color', default: 'rgb(41 98 255 / 10%)' }
  ]
} as const satisfies StudySchema

type StochParams = InferStudyValues<typeof STOCH_SCHEMA.inputs> &
  InferStudyValues<typeof STOCH_SCHEMA.style> &
  InferStudyValues<typeof STOCH_SCHEMA.text>

export class Stochastic extends AbstractIndicator implements Indicator {
  static readonly ikey = 'stochastic' as const

  #chart: IChartApi
  #params: StochParams

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
    this.#params = resolveStudyParams(STOCH_SCHEMA.inputs, STOCH_SCHEMA.style, STOCH_SCHEMA.text, options?.params)

    this.#series = {
      k: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['stochastic-kLine'], priceLineVisible: false },
        this.paneIndex
      ),
      d: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['stochastic-dLine'], priceLineVisible: false },
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
          baseValue: { type: 'price', price: 20 },
          topFillColor1: this.#params['stochastic-fill-color'],
          topFillColor2: this.#params['stochastic-fill-color'],
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
      ikey: Stochastic.ikey,
      schema: STOCH_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(STOCH_SCHEMA.inputs, STOCH_SCHEMA.style, STOCH_SCHEMA.text, params)
    this.#series.k.applyOptions({ color: this.#params['stochastic-kLine'] })
    this.#series.d.applyOptions({ color: this.#params['stochastic-dLine'] })
    this.#series.fill.applyOptions({
      topFillColor1: this.#params['stochastic-fill-color'],
      topFillColor2: this.#params['stochastic-fill-color'],
      baseValue: { type: 'price', price: this.#params['stochastic-lowerLimit'] }
    })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: Stochastic.ikey.toUpperCase(), paneIndex: this.paneIndex, data: [] }
    const kData = seriesData.get(this.#series.k)
    const dData = seriesData.get(this.#series.d)
    legend.data.push(
      { value: this.#params['stochastic-lengthK'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['stochastic-smoothK'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['stochastic-smoothD'].toString(), color: 'rgb(140, 140, 140)' }
    )
    if (kData && dData) {
      legend.data.push(
        { value: formatPrice((kData as LineData<Time>).value), color: this.#params['stochastic-kLine'] },
        { value: formatPrice((dData as LineData<Time>).value), color: this.#params['stochastic-dLine'] }
      )
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    const pp = this.#calculate(data)

    const firstTime = data[0].time
    const lastTime = data[data.length - 1].time

    this.#series.upperLine.setData([
      { time: firstTime, value: this.#params['stochastic-upperLimit'] },
      { time: lastTime, value: this.#params['stochastic-upperLimit'] }
    ])

    this.#series.lowerLine.setData([
      { time: firstTime, value: this.#params['stochastic-lowerLimit'] },
      { time: lastTime, value: this.#params['stochastic-lowerLimit'] }
    ])

    this.#series.fill.setData([
      { time: firstTime, value: this.#params['stochastic-upperLimit'] },
      { time: lastTime, value: this.#params['stochastic-upperLimit'] }
    ])

    this.#series.k.setData(pp.k)
    this.#series.d.setData(pp.d)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.k)
    this.#chart.removeSeries(this.#series.d)
  }

  #calculate(bars: ChartBar[]) {
    const close = getSourceSeries(bars, 'close')
    const high = getSourceSeries(bars, 'high')
    const low = getSourceSeries(bars, 'low')

    const stochRaw = ta.stoch(close, high, low, this.#params['stochastic-lengthK'])
    const k = ta.sma(stochRaw, this.#params['stochastic-smoothK'])
    const d = ta.sma(k, this.#params['stochastic-smoothD'])

    const kData = k.toArray().map((value, i) => ({
      time: bars[i].time,
      value: value ?? NaN
    }))

    const dData = d.toArray().map((value, i) => ({
      time: bars[i].time,
      value: value ?? NaN
    }))

    return {
      k: this.filter(kData),
      d: this.filter(dData)
    }
  }
}

import { BaselineSeries, LineSeries, LineStyle } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { getSourceSeries, ta } from 'oakscriptjs'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorName, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'

const STOCHRSI_SCHEMA = {
  inputs: [
    { type: 'number', key: 'rsiLength', default: 14, min: 1 },
    { type: 'number', key: 'stochLength', default: 14, min: 1 },
    { type: 'number', key: 'smoothK', default: 3, min: 1 },
    { type: 'number', key: 'smoothD', default: 3, min: 1 }
  ],
  style: [
    { type: 'color', key: 'kLine', default: 'rgb(41 98 255)' },
    { type: 'color', key: 'dLine', default: 'rgb(255 109 0)' }
  ]
} as const satisfies StudySchema

type StochRSIParams = InferStudyValues<typeof STOCHRSI_SCHEMA.inputs> & InferStudyValues<typeof STOCHRSI_SCHEMA.style>

export class StochasticRSI extends AbstractIndicator implements Indicator {
  static readonly ikey: IndicatorName = 'stochastic-rsi'

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
    this.#params = resolveStudyParams(STOCHRSI_SCHEMA.inputs, STOCHRSI_SCHEMA.style, options?.params)

    this.#series = {
      k: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.kLine, priceLineVisible: false },
        this.paneIndex
      ),
      d: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.dLine, priceLineVisible: false },
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
      ikey: StochasticRSI.ikey,
      schema: STOCHRSI_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(STOCHRSI_SCHEMA.inputs, STOCHRSI_SCHEMA.style, params)
    this.#series.k.applyOptions({ color: this.#params.kLine })
    this.#series.d.applyOptions({ color: this.#params.dLine })
  }

  getLegend(seriesData: SeriesMap) {
    const kData = seriesData.get(this.#series.k)
    const dData = seriesData.get(this.#series.d)

    if (kData && dData) {
      return {
        key: StochasticRSI.ikey.toUpperCase(),
        paneIndex: this.paneIndex,
        data: [
          { value: formatPrice((kData as LineData<Time>).value), color: this.#params.kLine },
          { value: formatPrice((dData as LineData<Time>).value), color: this.#params.dLine }
        ]
      }
    }

    return
  }

  protected onData(data: ChartBar[]) {
    const pp = this.#calculate(data)

    const firstTime = data[0].time
    const lastTime = data[data.length - 1].time

    this.#series.upperLine.setData([
      { time: firstTime, value: 80 },
      { time: lastTime, value: 80 }
    ])

    this.#series.lowerLine.setData([
      { time: firstTime, value: 20 },
      { time: lastTime, value: 20 }
    ])

    this.#series.fill.setData([
      { time: firstTime, value: 80 },
      { time: lastTime, value: 80 }
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
    const rsi = ta.rsi(close, this.#params.rsiLength)

    const stochRSI = ta.stoch(rsi, rsi, rsi, this.#params.stochLength)
    const k = ta.sma(stochRSI, this.#params.smoothK)
    const d = ta.sma(k, this.#params.smoothD)

    const toMapped = (arr: number[]) => arr.map((value, i) => ({ time: bars[i].time, value: value ?? NaN }))

    return {
      k: this.filter(toMapped(k.toArray())),
      d: this.filter(toMapped(d.toArray()))
    }
  }
}

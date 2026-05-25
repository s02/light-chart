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

const STOCH_SCHEMA = {
  inputs: [
    { type: 'number', key: 'lengthK', default: 14, min: 1 },
    { type: 'number', key: 'smoothK', default: 1, min: 1 },
    { type: 'number', key: 'smoothD', default: 3, min: 1 }
  ],
  style: [
    { type: 'color', key: 'kLine', default: 'rgb(41 98 255)' },
    { type: 'color', key: 'dLine', default: 'rgb(255 109 0)' }
  ]
} as const satisfies StudySchema

type StochParams = InferStudyValues<typeof STOCH_SCHEMA.inputs> & InferStudyValues<typeof STOCH_SCHEMA.style>

export class Stochastic extends AbstractIndicator implements Indicator {
  static readonly ikey: IndicatorName = 'stochastic'

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
    this.#params = resolveStudyParams(STOCH_SCHEMA.inputs, STOCH_SCHEMA.style, options?.params)

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
      ikey: Stochastic.ikey,
      schema: STOCH_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(STOCH_SCHEMA.inputs, STOCH_SCHEMA.style, params)
    this.#series.k.applyOptions({ color: this.#params.kLine })
    this.#series.d.applyOptions({ color: this.#params.dLine })
  }

  getLegend(seriesData: SeriesMap) {
    const kData = seriesData.get(this.#series.k)
    const dData = seriesData.get(this.#series.d)

    if (kData && dData) {
      return {
        key: Stochastic.ikey.toUpperCase(),
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
  }

  #calculate(bars: ChartBar[]) {
    const close = getSourceSeries(bars, 'close')
    const high = getSourceSeries(bars, 'high')
    const low = getSourceSeries(bars, 'low')

    const stochRaw = ta.stoch(close, high, low, this.#params.lengthK)
    const k = ta.sma(stochRaw, this.#params.smoothK)
    const d = ta.sma(k, this.#params.smoothD)

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

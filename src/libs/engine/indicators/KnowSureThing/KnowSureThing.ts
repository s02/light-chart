import { LineSeries } from 'lightweight-charts'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { formatPrice } from '@engine/helpers'
import { getSourceSeries, ta } from 'oakscriptjs'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'

const KST_SCHEMA = {
  inputs: [
    { type: 'number', key: 'roc1', default: 10, min: 1 },
    { type: 'number', key: 'sma1', default: 10, min: 1 },
    { type: 'number', key: 'roc2', default: 15, min: 1 },
    { type: 'number', key: 'sma2', default: 10, min: 1 },
    { type: 'number', key: 'roc3', default: 20, min: 1 },
    { type: 'number', key: 'sma3', default: 10, min: 1 },
    { type: 'number', key: 'roc4', default: 30, min: 1 },
    { type: 'number', key: 'sma4', default: 15, min: 1 },
    { type: 'number', key: 'signal', default: 9, min: 1 }
  ],
  style: [
    { type: 'color', key: 'kstLine', default: 'rgb(41 98 255)' },
    { type: 'color', key: 'signalLine', default: 'rgb(255 109 0)' }
  ]
} as const satisfies StudySchema

type KSTParams = InferStudyValues<typeof KST_SCHEMA.inputs> & InferStudyValues<typeof KST_SCHEMA.style>

export class KnowSureThing extends AbstractIndicator implements Indicator {
  static readonly ikey = 'kst' as const

  #chart: IChartApi
  #params: KSTParams

  #series: {
    kst: ISeriesApi<SeriesType>
    signal: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(KST_SCHEMA.inputs, KST_SCHEMA.style, options?.params)

    this.#series = {
      kst: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.kstLine, priceLineVisible: false },
        this.paneIndex
      ),
      signal: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.signalLine, priceLineVisible: false },
        this.paneIndex
      )
    }
  }

  getSchema() {
    return {
      ikey: KnowSureThing.ikey,
      schema: KST_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(KST_SCHEMA.inputs, KST_SCHEMA.style, params)
    this.#series.kst.applyOptions({ color: this.#params.kstLine })
    this.#series.signal.applyOptions({ color: this.#params.signalLine })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'KST', paneIndex: this.paneIndex, data: [] }
    const kstData = seriesData.get(this.#series.kst)
    const signalData = seriesData.get(this.#series.signal)
    if (kstData && signalData) {
      legend.data.push(
        { value: formatPrice((kstData as LineData<Time>).value), color: this.#params.kstLine },
        { value: formatPrice((signalData as LineData<Time>).value), color: this.#params.signalLine }
      )
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    const { kst, signal } = this.#calculate(data)
    this.#series.kst.setData(kst)
    this.#series.signal.setData(signal)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.kst)
    this.#chart.removeSeries(this.#series.signal)
  }

  #calculate(bars: ChartBar[]) {
    const close = getSourceSeries(bars, 'close')

    const rcma1 = ta.sma(ta.roc(close, this.#params.roc1), this.#params.sma1)
    const rcma2 = ta.sma(ta.roc(close, this.#params.roc2), this.#params.sma2)
    const rcma3 = ta.sma(ta.roc(close, this.#params.roc3), this.#params.sma3)
    const rcma4 = ta.sma(ta.roc(close, this.#params.roc4), this.#params.sma4)

    const kstSeries = rcma1.mul(1).add(rcma2.mul(2)).add(rcma3.mul(3)).add(rcma4.mul(4))
    const signalSeries = ta.sma(kstSeries, this.#params.signal)

    const toBar = (value: number, i: number) => ({
      time: bars[i].time,
      value: value ?? NaN
    })

    const kst = this.filter(kstSeries.toArray().map(toBar))
    const signal = this.filter(signalSeries.toArray().map(toBar))

    return { kst, signal }
  }
}

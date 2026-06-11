import { LineSeries } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'
import { getSourceSeries, ta } from 'oakscriptjs'

const CKS_SCHEMA = {
  inputs: [
    { type: 'number', key: 'p', default: 10, min: 1 },
    { type: 'number', key: 'x', default: 1, min: 0.1, step: 0.1 },
    { type: 'number', key: 'q', default: 9, min: 1 }
  ],
  style: [
    { type: 'color', key: 'stopShort', default: 'rgb(242 54 69)' },
    { type: 'color', key: 'stopLong', default: 'rgb(76 175 80)' }
  ]
} as const satisfies StudySchema

type CKSParams = InferStudyValues<typeof CKS_SCHEMA.inputs> & InferStudyValues<typeof CKS_SCHEMA.style>

export class ChandeKrollStop extends AbstractIndicator implements Indicator {
  static readonly ikey = 'cks' as const

  #chart: IChartApi
  #params: CKSParams

  #series: {
    stopShort: ISeriesApi<SeriesType>
    stopLong: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(CKS_SCHEMA.inputs, CKS_SCHEMA.style, options.params)

    this.#series = {
      stopShort: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.stopShort, priceLineVisible: false },
        this.paneIndex
      ),
      stopLong: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.stopLong, priceLineVisible: false },
        this.paneIndex
      )
    }
  }

  getSchema() {
    return {
      ikey: ChandeKrollStop.ikey,
      schema: CKS_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(CKS_SCHEMA.inputs, CKS_SCHEMA.style, params)
    this.#series.stopShort.applyOptions({ color: this.#params.stopShort })
    this.#series.stopLong.applyOptions({ color: this.#params.stopLong })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'CKS', paneIndex: this.paneIndex, data: [] }
    const shortData = seriesData.get(this.#series.stopShort)
    const longData = seriesData.get(this.#series.stopLong)
    if (shortData && longData) {
      legend.data.push(
        { value: formatPrice((longData as LineData<Time>).value), color: this.#params.stopLong },
        { value: formatPrice((shortData as LineData<Time>).value), color: this.#params.stopShort }
      )
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    const pp = this.#calculate(data)
    this.#series.stopShort.setData(pp.stopShort)
    this.#series.stopLong.setData(pp.stopLong)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.stopShort)
    this.#chart.removeSeries(this.#series.stopLong)
  }

  #calculate(bars: ChartBar[]) {
    const high = getSourceSeries(bars, 'high')
    const atrSeries = ta.atr(bars, this.#params.p)

    const firstHighStop = ta.highest(high, this.#params.p).sub(atrSeries.mul(this.#params.x))
    const firstLowStop = ta.lowest(high, this.#params.p).add(atrSeries.mul(this.#params.x))

    const stopShort = ta.highest(firstHighStop, this.#params.q).toArray()
    const stopLong = ta.lowest(firstLowStop, this.#params.q).toArray()

    const toBar = (value: number, i: number) => ({
      time: bars[i].time,
      value: value ?? NaN
    })

    return {
      stopShort: this.filter(stopShort.map(toBar)),
      stopLong: this.filter(stopLong.map(toBar))
    }
  }
}

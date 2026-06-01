import { HistogramSeries } from 'lightweight-charts'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { formatPrice } from '@engine/helpers'
import { Series, ta } from 'oakscriptjs'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, HistogramData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'

const AO_SCHEMA = {
  inputs: [
    { type: 'number', key: 'fast', default: 5, min: 1 },
    { type: 'number', key: 'slow', default: 34, min: 1 }
  ],
  style: [
    { type: 'color', key: 'histUp', default: 'rgb(38 166 154)' },
    { type: 'color', key: 'histDown', default: 'rgb(239 83 80)' }
  ]
} as const satisfies StudySchema

type AOParams = InferStudyValues<typeof AO_SCHEMA.inputs> & InferStudyValues<typeof AO_SCHEMA.style>

export class AwesomeOscillator extends AbstractIndicator implements Indicator {
  static readonly ikey = 'ao' as const

  #chart: IChartApi
  #params: AOParams

  #series: {
    hist: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(AO_SCHEMA.inputs, AO_SCHEMA.style, options?.params)

    this.#series = {
      hist: this.#chart.addSeries(
        HistogramSeries,
        { ...COMMON_SERIES_SETTINGS, color: this.#params.histUp, priceLineVisible: false },
        this.paneIndex
      )
    }
  }

  getSchema() {
    return {
      ikey: AwesomeOscillator.ikey,
      schema: AO_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(AO_SCHEMA.inputs, AO_SCHEMA.style, params)
  }

  getLegend(seriesData: SeriesMap) {
    const histData = seriesData.get(this.#series.hist)

    if (histData) {
      const value = (histData as HistogramData<Time>).value
      return {
        key: 'AO',
        paneIndex: this.paneIndex,
        data: [{ value: formatPrice(value), color: value >= 0 ? this.#params.histUp : this.#params.histDown }]
      }
    }

    return
  }

  protected onData(data: ChartBar[]) {
    this.#series.hist.setData(this.#calculate(data))
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.hist)
  }

  #calculate(bars: ChartBar[]) {
    const midpoint = new Series(bars, (b) => (b.high + b.low) / 2)
    const fastSMA = ta.sma(midpoint, this.#params.fast)
    const slowSMA = ta.sma(midpoint, this.#params.slow)
    const aoValues = fastSMA.sub(slowSMA).toArray()

    return aoValues.map((value, i) => {
      const time = bars[i].time

      if (value == null || Number.isNaN(value)) {
        return { time }
      }

      const prev = i > 0 ? (aoValues[i - 1] ?? NaN) : NaN
      const color = value >= prev ? this.#params.histUp : this.#params.histDown

      return { time, value, color }
    })
  }
}

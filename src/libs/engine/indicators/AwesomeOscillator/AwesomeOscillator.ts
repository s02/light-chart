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
import type { SeriesLegend } from '@engine/series'

const AO_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'awo-fast', default: 5, min: 1, max: 9999 },
    { type: 'number', key: 'awo-slow', default: 34, min: 1, max: 9999 }
  ],
  style: [
    { type: 'color', key: 'awo-histUp', default: 'rgb(38 166 154)' },
    { type: 'color', key: 'awo-histDown', default: 'rgb(239 83 80)' }
  ]
} as const satisfies StudySchema

type AOParams = InferStudyValues<typeof AO_SCHEMA.inputs> &
  InferStudyValues<typeof AO_SCHEMA.style> &
  InferStudyValues<typeof AO_SCHEMA.text>

export class AwesomeOscillator extends AbstractIndicator implements Indicator {
  static readonly ikey = 'awo' as const

  #chart: IChartApi
  #params: AOParams

  #series: {
    hist: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(AO_SCHEMA.inputs, AO_SCHEMA.style, AO_SCHEMA.text, options?.params)

    this.#series = {
      hist: this.#chart.addSeries(
        HistogramSeries,
        { ...COMMON_SERIES_SETTINGS, color: this.#params['awo-histUp'], priceLineVisible: false },
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
    this.#params = resolveStudyParams(AO_SCHEMA.inputs, AO_SCHEMA.style, AO_SCHEMA.text, params)
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'AO', paneIndex: this.paneIndex, data: [] }
    const histData = seriesData.get(this.#series.hist)
    legend.data.push(
      { value: this.#params['awo-fast'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['awo-slow'].toString(), color: 'rgb(140, 140, 140)' }
    )
    if (histData) {
      const value = (histData as HistogramData<Time>).value
      legend.data.push({
        value: formatPrice(value),
        color: value >= 0 ? this.#params['awo-histUp'] : this.#params['awo-histDown']
      })
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    this.#series.hist.setData(this.#calculate(data))
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.hist)
  }

  #calculate(bars: ChartBar[]) {
    const midpoint = new Series(bars, (b) => (b.high + b.low) / 2)
    const fastSMA = ta.sma(midpoint, this.#params['awo-fast'])
    const slowSMA = ta.sma(midpoint, this.#params['awo-slow'])
    const aoValues = fastSMA.sub(slowSMA).toArray()

    return aoValues.map((value, i) => {
      const time = bars[i].time

      if (value == null || Number.isNaN(value)) {
        return { time }
      }

      const prev = i > 0 ? (aoValues[i - 1] ?? NaN) : NaN
      const color = value >= prev ? this.#params['awo-histUp'] : this.#params['awo-histDown']

      return { time, value, color }
    })
  }
}

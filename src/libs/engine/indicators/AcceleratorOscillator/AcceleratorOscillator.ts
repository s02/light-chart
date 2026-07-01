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

const AC_SCHEMA = {
  text: [],
  inputs: [],
  style: [
    { type: 'color', key: 'ao-histUp', default: 'rgb(38 166 154)' },
    { type: 'color', key: 'ao-histDown', default: 'rgb(239 83 80)' }
  ]
} as const satisfies StudySchema

type ACParams = InferStudyValues<typeof AC_SCHEMA.inputs> &
  InferStudyValues<typeof AC_SCHEMA.style> &
  InferStudyValues<typeof AC_SCHEMA.text>

export class AcceleratorOscillator extends AbstractIndicator implements Indicator {
  static readonly ikey = 'aco' as const

  #chart: IChartApi
  #params: ACParams

  #series: {
    hist: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(AC_SCHEMA.inputs, AC_SCHEMA.style, AC_SCHEMA.text, options?.params)

    this.#series = {
      hist: this.#chart.addSeries(
        HistogramSeries,
        { ...COMMON_SERIES_SETTINGS, color: this.#params['ao-histUp'], priceLineVisible: false },
        this.paneIndex
      )
    }
  }

  getSchema() {
    return {
      ikey: AcceleratorOscillator.ikey,
      schema: AC_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(AC_SCHEMA.inputs, AC_SCHEMA.style, AC_SCHEMA.text, params)
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'AC', paneIndex: this.paneIndex, data: [] }
    const histData = seriesData.get(this.#series.hist)
    if (histData) {
      const value = (histData as HistogramData<Time>).value
      const color = value >= 0 ? this.#params['ao-histUp'] : this.#params['ao-histDown']
      legend.data.push({ value: formatPrice(value), color })
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
    const ao = ta.sma(midpoint, 5).sub(ta.sma(midpoint, 34))
    const acValues = ao.sub(ta.sma(ao, 5)).toArray()

    return acValues.map((value, i) => {
      const time = bars[i].time
      if (value == null || Number.isNaN(value)) return { time }
      const prev = i > 0 ? (acValues[i - 1] ?? NaN) : NaN
      const color = value >= prev ? this.#params['ao-histUp'] : this.#params['ao-histDown']
      return { time, value, color }
    })
  }
}

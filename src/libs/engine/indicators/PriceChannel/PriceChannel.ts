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

const PC_SCHEMA = {
  inputs: [
    { type: 'number', key: 'length', default: 20, min: 1 },
    { type: 'number', key: 'offset', default: 0, min: 0 }
  ],
  style: [
    { type: 'color', key: 'upper', default: 'rgb(245 0 87)' },
    { type: 'color', key: 'middle', default: 'rgb(33, 150, 243)' },
    { type: 'color', key: 'lower', default: 'rgb(245 0 87)' }
  ]
} as const satisfies StudySchema

type PCParams = InferStudyValues<typeof PC_SCHEMA.inputs> & InferStudyValues<typeof PC_SCHEMA.style>

export class PriceChannel extends AbstractIndicator implements Indicator {
  static readonly ikey = 'pricechannel' as const

  #chart: IChartApi
  #params: PCParams

  #series: {
    upper: ISeriesApi<SeriesType>
    middle: ISeriesApi<SeriesType>
    lower: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(PC_SCHEMA.inputs, PC_SCHEMA.style, options?.params)

    this.#series = {
      upper: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.upper, priceLineVisible: false },
        this.paneIndex
      ),
      middle: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.middle, priceLineVisible: false },
        this.paneIndex
      ),
      lower: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.lower, priceLineVisible: false },
        this.paneIndex
      )
    }
  }

  getSchema() {
    return {
      ikey: PriceChannel.ikey,
      schema: PC_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(PC_SCHEMA.inputs, PC_SCHEMA.style, params)
    this.#series.upper.applyOptions({ color: this.#params.upper })
    this.#series.middle.applyOptions({ color: this.#params.middle })
    this.#series.lower.applyOptions({ color: this.#params.lower })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'PC', paneIndex: this.paneIndex, data: [] }
    const uData = seriesData.get(this.#series.upper)
    const mData = seriesData.get(this.#series.middle)
    const lData = seriesData.get(this.#series.lower)
    if (uData && mData && lData) {
      legend.data.push(
        { value: formatPrice((uData as LineData<Time>).value), color: this.#params.upper },
        { value: formatPrice((lData as LineData<Time>).value), color: this.#params.lower },
        { value: formatPrice((mData as LineData<Time>).value), color: this.#params.middle }
      )
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    const pp = this.#calculate(data)
    this.#series.upper.setData(pp.upper)
    this.#series.middle.setData(pp.middle)
    this.#series.lower.setData(pp.lower)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.upper)
    this.#chart.removeSeries(this.#series.middle)
    this.#chart.removeSeries(this.#series.lower)
  }

  #calculate(bars: ChartBar[]) {
    const high = getSourceSeries(bars, 'high')
    const low = getSourceSeries(bars, 'low')

    const upper = ta.highest(high, this.#params.length).toArray()
    const lower = ta.lowest(low, this.#params.length).toArray()
    const middle = upper.map((u, i) => {
      const l = lower[i]
      return u !== null && l !== null && !isNaN(u) && !isNaN(l) ? (u + l) / 2 : NaN
    })

    const shifted = {
      upper: this.applyOffset(upper, this.#params.offset),
      middle: this.applyOffset(middle, this.#params.offset),
      lower: this.applyOffset(lower, this.#params.offset)
    }

    const toBar = (value: number, i: number) => ({
      time: bars[i].time,
      value: value ?? NaN
    })

    return {
      upper: this.filter(shifted.upper.map(toBar)),
      middle: this.filter(shifted.middle.map(toBar)),
      lower: this.filter(shifted.lower.map(toBar))
    }
  }
}

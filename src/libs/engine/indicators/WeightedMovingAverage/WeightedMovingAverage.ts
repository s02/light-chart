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

const WMA_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'wma-length', default: 9, min: 1, max: 9999 },
    { type: 'number', key: 'wma-offset', default: 0, min: 0, max: 9999 }
  ],
  style: [{ type: 'color', key: 'wma-color', default: 'rgb(255 109 0)' }]
} as const satisfies StudySchema

type WMAParams = InferStudyValues<typeof WMA_SCHEMA.inputs> &
  InferStudyValues<typeof WMA_SCHEMA.style> &
  InferStudyValues<typeof WMA_SCHEMA.text>

export class WeightedMovingAverage extends AbstractIndicator implements Indicator {
  static readonly ikey = 'wma' as const

  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #params: WMAParams

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(WMA_SCHEMA.inputs, WMA_SCHEMA.style, WMA_SCHEMA.text, options.params)

    this.#series = this.#chart.addSeries(
      LineSeries,
      { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['wma-color'], priceLineVisible: false },
      this.paneIndex
    )
  }

  getSchema() {
    return {
      ikey: WeightedMovingAverage.ikey,
      schema: WMA_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(WMA_SCHEMA.inputs, WMA_SCHEMA.style, WMA_SCHEMA.text, params)
    this.#series.applyOptions({ color: this.#params['wma-color'] })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'WMA', paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series)
    legend.data.push(
      { value: this.#params['wma-length'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['wma-offset'].toString(), color: 'rgb(140, 140, 140)' },
      { value: 'close', color: 'rgb(140, 140, 140)' }
    )
    if (data) {
      legend.data.push({ value: formatPrice((data as LineData<Time>).value), color: this.#params['wma-color'] })
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    this.#series.setData(this.#calculate(data))
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series)
  }

  #calculate(bars: ChartBar[]) {
    const source = getSourceSeries(bars, 'close')
    const shifted = this.applyOffset(ta.wma(source, this.#params['wma-length']).toArray(), this.#params['wma-offset'])

    const toBar = (value: number, i: number) => ({
      time: bars[i].time,
      value: value ?? NaN
    })

    return this.filter(shifted.map(toBar))
  }
}

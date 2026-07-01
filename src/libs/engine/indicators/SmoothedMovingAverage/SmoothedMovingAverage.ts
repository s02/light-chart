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

const SMMA_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'smma-length', default: 7, min: 1, max: 9999 },
    { type: 'number', key: 'smma-offset', default: 0, min: 0, max: 9999 }
  ],
  style: [{ type: 'color', key: 'smma-color', default: 'rgb(255 109 0)' }]
} as const satisfies StudySchema

type SMMAParams = InferStudyValues<typeof SMMA_SCHEMA.inputs> &
  InferStudyValues<typeof SMMA_SCHEMA.style> &
  InferStudyValues<typeof SMMA_SCHEMA.text>

export class SmoothedMovingAverage extends AbstractIndicator implements Indicator {
  static readonly ikey = 'smma' as const

  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #params: SMMAParams

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(SMMA_SCHEMA.inputs, SMMA_SCHEMA.style, SMMA_SCHEMA.text, options.params)

    this.#series = this.#chart.addSeries(
      LineSeries,
      { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['smma-color'], priceLineVisible: false },
      this.paneIndex
    )
  }

  getSchema() {
    return {
      ikey: SmoothedMovingAverage.ikey,
      schema: SMMA_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(SMMA_SCHEMA.inputs, SMMA_SCHEMA.style, SMMA_SCHEMA.text, params)
    this.#series.applyOptions({ color: this.#params['smma-color'] })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'SMMA', paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series)
    legend.data.push(
      { value: this.#params['smma-length'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['smma-offset'].toString(), color: 'rgb(140, 140, 140)' },
      { value: 'close', color: 'rgb(140, 140, 140)' }
    )
    if (data) {
      legend.data.push({ value: formatPrice((data as LineData<Time>).value), color: this.#params['smma-color'] })
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
    const shifted = this.applyOffset(ta.rma(source, this.#params['smma-length']).toArray(), this.#params['smma-offset'])

    const toBar = (value: number, i: number) => ({
      time: bars[i].time,
      value: value ?? NaN
    })

    return this.filter(shifted.map(toBar))
  }
}

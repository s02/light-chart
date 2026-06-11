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

const LSMA_SCHEMA = {
  inputs: [
    { type: 'number', key: 'length', default: 25, min: 1 },
    { type: 'number', key: 'offset', default: 0, min: 0 }
  ],
  style: [{ type: 'color', key: 'color', default: 'rgb(255 109 0)' }]
} as const satisfies StudySchema

type LSMAParams = InferStudyValues<typeof LSMA_SCHEMA.inputs> & InferStudyValues<typeof LSMA_SCHEMA.style>

export class LeastSquaresMA extends AbstractIndicator implements Indicator {
  static readonly ikey = 'lsma' as const

  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #params: LSMAParams

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(LSMA_SCHEMA.inputs, LSMA_SCHEMA.style, options.params)

    this.#series = this.#chart.addSeries(
      LineSeries,
      { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.color, priceLineVisible: false },
      this.paneIndex
    )
  }

  getSchema() {
    return {
      ikey: LeastSquaresMA.ikey,
      schema: LSMA_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(LSMA_SCHEMA.inputs, LSMA_SCHEMA.style, params)
    this.#series.applyOptions({ color: this.#params.color })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'LSMA', paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series)
    if (data) {
      legend.data.push({ value: formatPrice((data as LineData<Time>).value), color: this.#params.color })
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
    const values = ta.linreg(source, this.#params.length, this.#params.offset).toArray()

    const toBar = (value: number, i: number) => ({
      time: bars[i].time,
      value: value ?? NaN
    })

    return this.filter(values.map(toBar))
  }
}

import { LineSeries } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { ta } from 'oakscriptjs'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'

const ATR_SCHEMA = {
  text: [],
  inputs: [{ type: 'number', key: 'atr-length', default: 14, min: 1, max: 9999 }],
  style: [{ type: 'color', key: 'atr-color', default: 'rgb(255 109 0)' }]
} as const satisfies StudySchema

type ATRParams = InferStudyValues<typeof ATR_SCHEMA.inputs> &
  InferStudyValues<typeof ATR_SCHEMA.style> &
  InferStudyValues<typeof ATR_SCHEMA.text>

export class ATR extends AbstractIndicator implements Indicator {
  static readonly ikey = 'atr' as const

  #chart: IChartApi
  #params: ATRParams
  #series: ISeriesApi<SeriesType>

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(ATR_SCHEMA.inputs, ATR_SCHEMA.style, ATR_SCHEMA.text, options?.params)

    this.#series = this.#chart.addSeries(
      LineSeries,
      { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['atr-color'], priceLineVisible: false },
      this.paneIndex
    )
  }

  getSchema() {
    return {
      ikey: ATR.ikey,
      schema: ATR_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(ATR_SCHEMA.inputs, ATR_SCHEMA.style, ATR_SCHEMA.text, params)
    this.#series.applyOptions({ color: this.#params['atr-color'] })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'ATR', paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series)
    legend.data.push({ value: this.#params['atr-length'].toString(), color: 'rgb(140, 140, 140)' })
    if (data) {
      legend.data.push({ value: formatPrice((data as LineData<Time>).value), color: this.#params['atr-color'] })
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
    const values = ta.atr(bars, this.#params['atr-length']).toArray()
    return this.filter(values.map((value, i) => ({ time: bars[i].time, value: value ?? NaN })))
  }
}

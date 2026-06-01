import { LineSeries } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import { getSourceSeries, ta } from 'oakscriptjs'

const EMA_CROSS_SCHEMA = {
  inputs: [
    { type: 'number', key: 'shortLength', default: 9, min: 1 },
    { type: 'number', key: 'longLength', default: 26, min: 1 }
  ],
  style: [
    { type: 'color', key: 'short', default: 'rgb(255 109 0)' },
    { type: 'color', key: 'long', default: 'rgb(67 160 71)' }
  ]
} as const satisfies StudySchema

type EMACrossParams = InferStudyValues<typeof EMA_CROSS_SCHEMA.inputs> & InferStudyValues<typeof EMA_CROSS_SCHEMA.style>

export class EMACross extends AbstractIndicator implements Indicator {
  static readonly ikey = 'emacross' as const

  #chart: IChartApi
  #params: EMACrossParams

  #series: {
    fast: ISeriesApi<SeriesType>
    slow: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(EMA_CROSS_SCHEMA.inputs, EMA_CROSS_SCHEMA.style, options?.params)

    this.#series = {
      fast: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.short, priceLineVisible: false },
        this.paneIndex
      ),
      slow: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.long, priceLineVisible: false },
        this.paneIndex
      )
    }
  }

  getSchema() {
    return {
      ikey: EMACross.ikey,
      schema: EMA_CROSS_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(EMA_CROSS_SCHEMA.inputs, EMA_CROSS_SCHEMA.style, params)
    this.#series.fast.applyOptions({ color: this.#params.short })
    this.#series.slow.applyOptions({ color: this.#params.long })
  }

  getLegend(seriesData: SeriesMap) {
    const fastData = seriesData.get(this.#series.fast)
    const slowData = seriesData.get(this.#series.slow)

    if (fastData && slowData) {
      return {
        key: 'EMA CROSS',
        paneIndex: this.paneIndex,
        data: [
          { value: formatPrice((fastData as LineData<Time>).value), color: this.#params.short },
          { value: formatPrice((slowData as LineData<Time>).value), color: this.#params.long }
        ]
      }
    }

    return
  }

  protected onData(data: ChartBar[]) {
    const pp = this.#calculate(data)
    this.#series.fast.setData(pp.fast)
    this.#series.slow.setData(pp.slow)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.fast)
    this.#chart.removeSeries(this.#series.slow)
  }

  #calculate(bars: ChartBar[]) {
    const source = getSourceSeries(bars, 'close')
    const fastArr = ta.ema(source, this.#params.shortLength).toArray()
    const slowArr = ta.ema(source, this.#params.longLength).toArray()

    const toBar = (value: number, i: number) => ({
      time: bars[i].time,
      value: value ?? NaN
    })

    return {
      fast: this.filter(fastArr.map(toBar)),
      slow: this.filter(slowArr.map(toBar))
    }
  }
}

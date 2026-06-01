import { LineSeries } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import { ta } from 'oakscriptjs'

const ST_SCHEMA = {
  inputs: [
    { type: 'number', key: 'length', default: 10, min: 1 },
    { type: 'number', key: 'factor', default: 3, min: 1, step: 1 }
  ],
  style: [
    { type: 'color', key: 'bullish', default: 'rgb(0 229 204)' },
    { type: 'color', key: 'bearish', default: 'rgb(255 82 82)' }
  ]
} as const satisfies StudySchema

type STParams = InferStudyValues<typeof ST_SCHEMA.inputs> & InferStudyValues<typeof ST_SCHEMA.style>

export class Supertrend extends AbstractIndicator implements Indicator {
  static readonly ikey = 'supertrend' as const

  #chart: IChartApi
  #params: STParams
  #series: ISeriesApi<SeriesType>
  #lastBars: ChartBar[] = []

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(ST_SCHEMA.inputs, ST_SCHEMA.style, options?.params)

    this.#series = this.#chart.addSeries(
      LineSeries,
      { ...COMMON_SERIES_SETTINGS, lineWidth: 2, priceLineVisible: false },
      this.paneIndex
    )
  }

  getSchema() {
    return {
      ikey: Supertrend.ikey,
      schema: ST_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(ST_SCHEMA.inputs, ST_SCHEMA.style, params)
    if (this.#lastBars.length) {
      this.#series.setData(this.#calculate(this.#lastBars))
    }
  }

  getLegend(seriesData: SeriesMap) {
    const data = seriesData.get(this.#series) as LineData<Time> | undefined

    if (data) {
      return {
        key: Supertrend.ikey.toUpperCase(),
        paneIndex: this.paneIndex,
        data: [{ value: formatPrice(data.value), color: data.color ?? this.#params.bullish }]
      }
    }

    return
  }

  protected onData(data: ChartBar[]) {
    this.#lastBars = data
    this.#series.setData(this.#calculate(data))
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series)
  }

  #calculate(bars: ChartBar[]) {
    const [trendSeries, dirSeries] = ta.supertrend(bars, this.#params.factor, this.#params.length)

    const trendArr = trendSeries.toArray()
    const dirArr = dirSeries.toArray()

    return trendArr.map((value, i) => {
      const time = bars[i].time

      if (!value) return { time }

      const dir = dirArr[i]
      const nextDir = dirArr[i + 1]
      const effectiveDir = nextDir && nextDir !== dir ? nextDir : dir

      return {
        time,
        value,
        color: effectiveDir === -1 ? this.#params.bullish : this.#params.bearish
      }
    })
  }
}

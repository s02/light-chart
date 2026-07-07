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

const MD_SCHEMA = {
  text: [],
  inputs: [{ type: 'number', key: 'md-length', default: 14, min: 1, max: 9999 }],
  style: [{ type: 'color', key: 'md-color', default: 'rgb(255 109 0)' }]
} as const satisfies StudySchema

type MDParams = InferStudyValues<typeof MD_SCHEMA.inputs> &
  InferStudyValues<typeof MD_SCHEMA.style> &
  InferStudyValues<typeof MD_SCHEMA.text>

export class McGinleyDynamic extends AbstractIndicator implements Indicator {
  static readonly ikey = 'md' as const

  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #params: MDParams

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(MD_SCHEMA.inputs, MD_SCHEMA.style, MD_SCHEMA.text, options.params)

    this.#series = this.#chart.addSeries(
      LineSeries,
      { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['md-color'], priceLineVisible: false },
      this.paneIndex
    )
  }

  getSchema() {
    return {
      ikey: McGinleyDynamic.ikey,
      schema: MD_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(MD_SCHEMA.inputs, MD_SCHEMA.style, MD_SCHEMA.text, params)
    this.#series.applyOptions({ color: this.#params['md-color'] })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'MD', paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series)
    legend.data.push({ value: this.#params['md-length'].toString(), color: 'rgb(140, 140, 140)' })
    if (data) {
      legend.data.push({ value: formatPrice((data as LineData<Time>).value), color: this.#params['md-color'] })
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
    const closes = getSourceSeries(bars, 'close')
    const n = this.#params['md-length']
    const prices = closes.toArray()
    const ema = ta.ema(closes, n).toArray()
    const result: number[] = new Array(bars.length).fill(NaN)

    let mg = NaN
    for (let i = 0; i < prices.length; i++) {
      const price = prices[i]
      if (!price || isNaN(price)) continue

      if (isNaN(mg)) {
        mg = ema[i]
      } else {
        const r = mg + (price - mg) / (n * Math.pow(price / mg, 4))
        mg = isNaN(r) ? ema[i] : r
      }
      result[i] = mg
    }

    const toBar = (value: number, i: number) => ({
      time: bars[i].time,
      value: value ?? NaN
    })

    return this.filter(result.map(toBar))
  }
}

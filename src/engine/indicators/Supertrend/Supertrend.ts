import { LineSeries, createSeriesMarkers } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type {
  IChartApi,
  ISeriesApi,
  ISeriesMarkersPluginApi,
  LineData,
  SeriesMarker,
  SeriesType,
  Time
} from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'
import { ta } from 'oakscriptjs'
import { helpers } from '@chart/helpers'

const ST_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'supertrend-length', default: 10, min: 1, max: 9999 },
    { type: 'number', key: 'supertrend-factor', default: 3, min: 1, step: 1, max: 9999 }
  ],
  style: [
    { type: 'bool', key: 'supertrend-visible', default: true },
    { type: 'color', key: 'supertrend-bullish-color', default: 'rgb(0 128 0 / 65%)' },
    { type: 'color', key: 'supertrend-bearish-color', default: 'rgb(128 0 0 / 65%)' },
    { type: 'bool', key: 'supertrend-up-arrow-visible', default: true },
    { type: 'color', key: 'supertrend-up-arrow-color', default: 'rgb(0 255 0 / 65%)' },
    { type: 'bool', key: 'supertrend-down-arrow-visible', default: true },
    { type: 'color', key: 'supertrend-down-arrow-color', default: 'rgb(255 0 0 / 65%)' }
  ]
} as const satisfies StudySchema

type STParams = InferStudyValues<typeof ST_SCHEMA.inputs> &
  InferStudyValues<typeof ST_SCHEMA.style> &
  InferStudyValues<typeof ST_SCHEMA.text>

export class Supertrend extends AbstractIndicator implements Indicator {
  static readonly ikey = 'supertrend' as const

  #chart: IChartApi
  #params: STParams
  #series: ISeriesApi<SeriesType>
  #markers: ISeriesMarkersPluginApi<Time>
  #lastBars: ChartBar[] = []

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(ST_SCHEMA.inputs, ST_SCHEMA.style, ST_SCHEMA.text, options?.params)

    this.#series = this.#chart.addSeries(
      LineSeries,
      {
        ...COMMON_SERIES_SETTINGS,
        lineWidth: 3,
        priceLineVisible: false,
        lineVisible: this.#params['supertrend-visible']
      },
      this.paneIndex
    )

    this.#markers = createSeriesMarkers(this.#series)
  }

  getSchema() {
    return {
      ikey: Supertrend.ikey,
      schema: ST_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    const currentParams = resolveStudyParams(ST_SCHEMA.inputs, ST_SCHEMA.style, ST_SCHEMA.text, params)

    if (currentParams['supertrend-visible'] !== this.#params['supertrend-visible']) {
      this.#series.applyOptions({ lineVisible: currentParams['supertrend-visible'] })
    }

    this.#params = currentParams

    if (this.#lastBars.length) {
      const { lineData, markers } = this.#calculate(this.#lastBars)
      this.#series.setData(lineData)
      this.#markers.setMarkers(markers)
    }
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: Supertrend.ikey.toUpperCase(), paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series) as LineData<Time> | undefined

    legend.data.push(
      { value: this.#params['supertrend-length'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['supertrend-factor'].toString(), color: 'rgb(140, 140, 140)' }
    )

    if (data) {
      const color = data.color ?? this.#params['supertrend-bullish-color']
      legend.data.push({ value: formatPrice(data.value), color: helpers.parseColor(color).baseColor })
    }

    return legend
  }

  protected onData(data: ChartBar[]) {
    this.#lastBars = data
    const { lineData, markers } = this.#calculate(data)
    this.#series.setData(lineData)
    this.#markers.setMarkers(markers)
  }

  protected removeSeries() {
    this.#markers.detach()
    this.#chart.removeSeries(this.#series)
  }

  #calculate(bars: ChartBar[]) {
    const [trendSeries, dirSeries] = ta.supertrend(
      bars,
      this.#params['supertrend-factor'],
      this.#params['supertrend-length']
    )

    const trendArr = trendSeries.toArray()
    const dirArr = dirSeries.toArray()
    const markers: SeriesMarker<Time>[] = []

    const lineData = trendArr.map((value, i) => {
      const time = bars[i].time

      if (!value) return { time }

      const dir = dirArr[i]
      const prevDir = dirArr[i - 1]
      const nextDir = dirArr[i + 1]
      const effectiveDir = nextDir && nextDir !== dir ? nextDir : dir

      if (prevDir !== undefined && dir !== prevDir) {
        if (dir === -1) {
          if (this.#params['supertrend-up-arrow-visible']) {
            markers.push({
              time,
              position: 'atPriceBottom',
              shape: 'arrowUp',
              color: this.#params['supertrend-up-arrow-color'],
              price: bars[i].low,
              size: 1
            })
          }
        } else {
          if (this.#params['supertrend-down-arrow-visible']) {
            markers.push({
              time,
              position: 'atPriceTop',
              shape: 'arrowDown',
              color: this.#params['supertrend-down-arrow-color'],
              price: bars[i].high,
              size: 1
            })
          }
        }
      }

      return {
        time,
        value,
        color: effectiveDir === -1 ? this.#params['supertrend-bullish-color'] : this.#params['supertrend-bearish-color']
      }
    })

    return { lineData, markers }
  }
}

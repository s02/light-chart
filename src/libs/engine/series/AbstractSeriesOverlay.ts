import { RESOLUTION_SETTINGS } from '@engine/constants'
import type { SeriesOverlay } from '@engine/series/types'
import type { Datafeed, DatafeedResult } from '@engine/types'
import type {
  CustomData,
  CustomSeriesOptions,
  IChartApi,
  ICustomSeriesPaneView,
  ISeriesApi,
  SeriesDefinition,
  SeriesPartialOptions,
  SeriesPartialOptionsMap,
  SeriesType,
  Time
} from 'lightweight-charts'

type NativeSeriesSettings = {
  custom?: false
  series: SeriesDefinition<SeriesType>
  options: SeriesPartialOptionsMap[SeriesType]
}

type CustomSeriesSettings = {
  custom: true
  series: ICustomSeriesPaneView<Time, CustomData, CustomSeriesOptions>
  options: SeriesPartialOptions<CustomSeriesOptions>
}

export type SeriesSettings = NativeSeriesSettings | CustomSeriesSettings

export abstract class AbstractSeriesOverlay implements SeriesOverlay {
  protected series: ISeriesApi<SeriesType>

  #datafeed: Datafeed
  #chart: IChartApi
  #datafeedSubscriptionId: number | null = null

  constructor(chart: IChartApi, datafeed: Datafeed, settings: SeriesSettings) {
    this.#chart = chart
    this.#datafeed = datafeed

    if (settings.custom) {
      this.series = this.#chart.addCustomSeries(settings.series, settings.options)
    } else {
      this.series = this.#chart.addSeries(settings.series, settings.options)
    }

    this.#init()
  }

  destroy() {
    this.#chart.removeSeries(this.series)

    if (!this.#datafeedSubscriptionId) {
      return
    }

    this.#datafeed.unsubscribe(this.#datafeedSubscriptionId)
  }

  getSeries() {
    return this.series
  }

  protected transformData(result: DatafeedResult) {
    if (result.type === 'set') {
      this.series.setData(result.data)
    } else {
      result.data.forEach((bar) => this.series.update(bar))
    }
  }

  #init() {
    return this.#subscribeToDatafeed().then(() => {
      this.#chart.timeScale().subscribeVisibleLogicalRangeChange(async (range) => {
        if (!range) {
          return
        }

        if (range.from < 10) {
          this.#requestCandles()
        }
      })
    })
  }

  #subscribeToDatafeed(): Promise<void> {
    return new Promise((resolve) => {
      this.#datafeed
        .subscribe((ev) => this.transformData(ev))
        .then((id) => {
          resolve()
          this.#datafeedSubscriptionId = id
        })
    })
  }

  #requestCandles() {
    const timeRange = this.#chart.timeScale().getVisibleRange()

    if (!timeRange?.from || !timeRange?.to) {
      return
    }

    const resolution = RESOLUTION_SETTINGS[this.#datafeed.getResolutionId()]
    const diff = (timeRange.to as number) - (timeRange.from as number)
    const candlesCount = Math.round(diff / resolution.seconds)

    this.#datafeed.loadHistory({ minCandles: candlesCount })
  }
}

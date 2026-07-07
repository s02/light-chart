import type { SeriesLegend, SeriesOverlay, SeriesOverlayData } from '@engine/series'
import type { Datafeed, DatafeedResult } from '@engine/types'
import type { IChartApi, ISeriesApi, SeriesDefinition, SeriesPartialOptionsMap, SeriesType } from 'lightweight-charts'

type SeriesSettings = {
  series: SeriesDefinition<SeriesType>
  options: SeriesPartialOptionsMap[SeriesType]
}

export abstract class AbstractSeriesOverlay<TData = SeriesOverlayData> implements SeriesOverlay<TData> {
  protected series: ISeriesApi<SeriesType>
  #datafeed: Datafeed
  #chart: IChartApi
  #datafeedSubscriptionId?: string
  #destroyed = false
  ready: Promise<void>
  #ready: (() => void) | null = null

  constructor(chart: IChartApi, datafeed: Datafeed, settings: SeriesSettings) {
    this.#chart = chart
    this.#datafeed = datafeed
    this.series = this.#chart.addSeries(settings.series, settings.options)
    this.ready = new Promise((resolve) => {
      this.#ready = resolve
    })
    queueMicrotask(() => this.#init())
  }

  abstract getLegend(data: TData): SeriesLegend

  destroy() {
    this.#destroyed = true
    this.#chart.removeSeries(this.series)

    if (!this.#datafeedSubscriptionId) {
      return
    }

    this.#datafeed.unsubscribe(this.#datafeedSubscriptionId)
  }

  setDatafeed(datafeed: Datafeed) {
    if (this.#datafeedSubscriptionId) {
      this.#datafeed.unsubscribe(this.#datafeedSubscriptionId)
    }

    this.#datafeed = datafeed
    queueMicrotask(() => this.#init())
  }

  getSeries() {
    return this.series
  }

  moveToTop() {
    this.series.setSeriesOrder(Number.MAX_SAFE_INTEGER)
  }

  protected transformData(result: DatafeedResult) {
    if (result.type === 'set') {
      this.series.setData(result.data)
      if (this.#ready) {
        this.#ready()
      }
    } else {
      result.data.forEach((bar) => this.series.update(bar))
    }
  }

  async #init() {
    if (this.#destroyed) {
      return
    }

    this.#datafeedSubscriptionId = await this.#datafeed.subscribe((ev) => this.transformData(ev))

    if (this.#destroyed) {
      this.#datafeed.unsubscribe(this.#datafeedSubscriptionId)
    }
  }
}

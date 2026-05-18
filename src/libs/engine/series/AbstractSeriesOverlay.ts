import { RESOLUTION_SETTINGS } from '@engine/constants'
import type { SeriesOverlay, SeriesOverlayData } from '@engine/series/types'
import type { Datafeed } from '@engine/types'
import type {
  IChartApi,
  ISeriesApi,
  LogicalRange,
  SeriesDefinition,
  SeriesPartialOptionsMap,
  SeriesType
} from 'lightweight-charts'

type SeriesSettings = {
  series: SeriesDefinition<SeriesType>
  options: SeriesPartialOptionsMap[SeriesType]
}

export abstract class AbstractSeriesOverlay<
  TData extends SeriesOverlayData = SeriesOverlayData
> implements SeriesOverlay<TData> {
  protected series: ISeriesApi<SeriesType>
  private datafeed: Datafeed
  private chart: IChartApi
  private datafeedSubscriptionId: string | null = null
  private destroyed = false

  constructor(chart: IChartApi, datafeed: Datafeed, settings: SeriesSettings) {
    this.chart = chart
    this.datafeed = datafeed
    this.series = this.chart.addSeries(settings.series, settings.options)
    queueMicrotask(() => this.#init())
  }

  abstract getLegend(data: TData): SeriesLegend

  destroy() {
    this.destroyed = true
    this.chart.removeSeries(this.series)

    if (!this.datafeedSubscriptionId) {
      return
    }

    this.datafeed.unsubscribe(this.datafeedSubscriptionId)
    this.chart.timeScale().unsubscribeVisibleLogicalRangeChange(this.#rangeChangeHandler)
  }

  setDatafeed(datafeed: Datafeed) {
    if (this.datafeedSubscriptionId) {
      this.datafeed.unsubscribe(this.datafeedSubscriptionId)
    }

    this.chart.timeScale().unsubscribeVisibleLogicalRangeChange(this.#rangeChangeHandler)
    this.datafeed = datafeed
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
    } else {
      result.data.forEach((bar) => this.series.update(bar))
    }
  }

  async #init() {
    if (this.destroyed) {
      return
    }

    this.datafeedSubscriptionId = await this.datafeed.subscribe((ev) => this.transformData(ev), 'series')

    if (this.destroyed) {
      this.datafeed.unsubscribe(this.datafeedSubscriptionId)
      return
    }

    this.chart.timeScale().subscribeVisibleLogicalRangeChange(this.#rangeChangeHandler)
  }

  #rangeChangeHandler = (range: LogicalRange | null) => {
    if (!range) {
      return
    }

    if (range.from < 10) {
      this.#requestCandles()
    }
  }

  #requestCandles() {
    const timeRange = this.chart.timeScale().getVisibleRange()

    if (!timeRange?.from || !timeRange?.to) {
      return
    }

    const resolution = RESOLUTION_SETTINGS[this.datafeed.getResolutionId()]
    const diff = (timeRange.to as number) - (timeRange.from as number)
    const candlesCount = Math.round(diff / resolution.seconds)

    this.datafeed.loadHistory({ minCandles: candlesCount })
  }
}

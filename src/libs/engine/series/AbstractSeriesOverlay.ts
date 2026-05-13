import { RESOLUTION_SETTINGS } from '@engine/constants'
import type { ChartSeriesLegend, Datafeed, DatafeedResult, SeriesOverlay, SeriesOverlayData } from '@engine/types'
import type { IChartApi, ISeriesApi, SeriesDefinition, SeriesPartialOptionsMap, SeriesType } from 'lightweight-charts'

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
  private datafeedSubscriptionId: number | null = null

  constructor(chart: IChartApi, datafeed: Datafeed, settings: SeriesSettings) {
    this.chart = chart
    this.datafeed = datafeed
    this.series = this.chart.addSeries(settings.series, settings.options)

    queueMicrotask(() => this.#init())
  }

  abstract getLegend(data: TData): Omit<ChartSeriesLegend, 'id' | 'category'>

  destroy() {
    this.chart.removeSeries(this.series)

    if (!this.datafeedSubscriptionId) {
      return
    }

    this.datafeed.unsubscribe(this.datafeedSubscriptionId)
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

  #init() {
    return this.#subscribeToDatafeed().then(() => {
      this.chart.timeScale().subscribeVisibleLogicalRangeChange(async (range) => {
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
      this.datafeed
        .subscribe((ev) => this.transformData(ev))
        .then((id) => {
          resolve()
          this.datafeedSubscriptionId = id
        })
    })
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

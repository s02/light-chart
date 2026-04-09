import { createChart } from 'lightweight-charts'
import { CHART_PARAMS, RESOLUTION_SETTINGS, SERIES_PARAMS, SERIES_SETTINGS } from './constants'
import { SimpleMovingAverage } from './indicators/SimpleMovingAverage'
import { IndicatorsOverlay } from './IndicatorsOverlay'
import { ExpirationOverlay } from './ExpirationOverlay'
import { OptionOverlay } from './OptionOverlay'
import type { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts'
import type { AssetSymbol, ChartExpiration, ChartOption, Datafeed, ResolutionId, SeriesId } from '@engine/types'

type Params = {
  datafeed: Datafeed
  seriesId?: SeriesId
  onResolutionChange?: (resolution: ResolutionId) => void
  onSeriesChange?: (series: SeriesId) => void
  onAssetSymbolChange?: (asset: AssetSymbol) => void
}

export class PlotEngine {
  #chart: IChartApi
  #datafeed: Datafeed
  #series: ISeriesApi<SeriesType>
  #datafeedSubscriptionId?: number
  #indicatorsOverlay: IndicatorsOverlay
  #expOverlay: ExpirationOverlay
  #optOverlay: OptionOverlay
  #onResolutionChange?: (resolution: ResolutionId) => void
  #onSeriesChange?: (series: SeriesId) => void
  #onAssetSymbolChange?: (asset: AssetSymbol) => void

  constructor(el: HTMLElement, params: Params) {
    this.#chart = createChart(el, CHART_PARAMS)
    this.#series = this.#chart.addSeries(SERIES_SETTINGS[params.seriesId || 'candlestick'].series, SERIES_PARAMS)
    this.#datafeed = params.datafeed
    this.#onResolutionChange = params.onResolutionChange
    this.#onSeriesChange = params.onSeriesChange
    this.#subscribeToDatafeed().then(() => {
      this.#chart.timeScale().subscribeVisibleLogicalRangeChange(async (range) => {
        if (!range) {
          return
        }

        if (range.from < 10) {
          this.#requestCandles()
        }
      })
    })

    this.#indicatorsOverlay = new IndicatorsOverlay()

    this.#expOverlay = new ExpirationOverlay(this.#chart, this.#series, this.#datafeed.getResolutionId())
    this.#optOverlay = new OptionOverlay(this.#chart, this.#series, this.#datafeed.getResolutionId())
  }

  setSeriesId(seriesId: SeriesId) {
    this.#chart.removeSeries(this.#series)

    this.#series = this.#chart.addSeries(SERIES_SETTINGS[seriesId].series, SERIES_PARAMS)
    this.#series.setData(this.#datafeed.getBars())
    this.#expOverlay.setSeries(this.#series)
    this.#optOverlay.setSeries(this.#series)

    if (this.#onSeriesChange) {
      this.#onSeriesChange(seriesId)
    }
  }

  async setDatafeed(datafeed: Datafeed) {
    const resolutionId = this.#datafeed.getResolutionId()
    const asset = this.#datafeed.getAssetSymbol()

    this.#datafeed.unsubscribe(this.#datafeedSubscriptionId!)
    this.#datafeed = datafeed

    this.#expOverlay.setResolution(resolutionId)
    this.#optOverlay.setResolution(resolutionId)
    this.#indicatorsOverlay.removeAll()

    await this.#subscribeToDatafeed()

    if (this.#onResolutionChange && resolutionId !== this.#datafeed.getResolutionId()) {
      this.#onResolutionChange(datafeed.getResolutionId())
    }

    if (this.#onAssetSymbolChange && asset.id !== this.#datafeed.getAssetSymbol().id) {
      this.#onAssetSymbolChange(this.#datafeed.getAssetSymbol())
    }
  }

  setOptions(options: ChartOption[]) {
    this.#optOverlay.setOptions(options)
  }

  setExpiration(expiration: ChartExpiration) {
    this.#expOverlay.setExpiration(expiration)
  }

  addIndicator() {
    this.#indicatorsOverlay.add(new SimpleMovingAverage(this.#chart, this.#datafeed))
  }

  destroy() {
    this.#datafeed.unsubscribe(this.#datafeedSubscriptionId!)
    this.#expOverlay.destroy()
    this.#optOverlay.destroy()
    this.#chart.remove()
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

  #subscribeToDatafeed(): Promise<void> {
    return new Promise((resolve) => {
      this.#datafeed
        .subscribe((ev) => {
          if (ev.type === 'set') {
            this.#series.setData(ev.data)
            resolve()
          } else {
            ev.data.forEach((bar) => this.#series.update(bar))
          }
        })
        .then((id) => {
          this.#datafeedSubscriptionId = id
        })
    })
  }
}

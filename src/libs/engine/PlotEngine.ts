import { createChart } from 'lightweight-charts'
import { CHART_PARAMS, RESOLUTION_SETTINGS, COMMON_SERIES_SETTINGS, SERIES_MAP } from './constants'
import { SimpleMovingAverage } from './indicators/SimpleMovingAverage'
import { IndicatorsOverlay } from './IndicatorsOverlay'
import { ExpirationOverlay } from './ExpirationOverlay'
import { OptionOverlay } from './OptionOverlay'
import { PluginOverlay } from './PluginOverlay'
import type { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts'
import type { ChartExpiration, ChartOption, Datafeed, SeriesId } from '@engine/types'

type Params = {
  datafeed: Datafeed
  seriesId?: SeriesId
}

export class PlotEngine {
  #chart: IChartApi
  #datafeed: Datafeed
  #series: ISeriesApi<SeriesType>
  #datafeedSubscriptionId?: number
  #indicatorsOverlay: IndicatorsOverlay
  #expOverlay: ExpirationOverlay
  #optOverlay: OptionOverlay
  #pluginOverlay: PluginOverlay

  constructor(el: HTMLElement, params: Params) {
    this.#chart = createChart(el, CHART_PARAMS)
    const seriesData = this.#getSeries(params.seriesId)
    this.#series = this.#chart.addSeries(seriesData.series, seriesData.options)
    this.#datafeed = params.datafeed
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
    this.#pluginOverlay = new PluginOverlay(this.#chart, this.#series, {
      assetSymbol: this.#datafeed.getAssetSymbol(),
      resolutionId: this.#datafeed.getResolutionId()
    })
  }

  setSeriesId(seriesId: SeriesId) {
    this.#chart.removeSeries(this.#series)

    const seriesData = this.#getSeries(seriesId)
    this.#series = this.#chart.addSeries(seriesData.series, seriesData.options)
    this.#series.setData(this.#datafeed.getBars())
    this.#pluginOverlay.setSeries(this.#series)
    this.#expOverlay.setSeries(this.#series)
    this.#optOverlay.setSeries(this.#series)
  }

  async setDatafeed(datafeed: Datafeed) {
    this.#datafeed.unsubscribe(this.#datafeedSubscriptionId!)
    this.#datafeed = datafeed

    const resolutionId = this.#datafeed.getResolutionId()
    const assetSymbol = this.#datafeed.getAssetSymbol()

    this.#expOverlay.setResolution(resolutionId)
    this.#optOverlay.setResolution(resolutionId)
    this.#pluginOverlay.setConfig({ assetSymbol, resolutionId })

    this.#optOverlay.clear()
    this.#indicatorsOverlay.clear()

    await this.#subscribeToDatafeed()
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
    this.#expOverlay.clear()
    this.#pluginOverlay.clear()
    this.#optOverlay.clear()
    this.#indicatorsOverlay.clear()
    this.#chart.remove()
  }

  #getSeries(seriesId?: SeriesId) {
    const data = SERIES_MAP[seriesId || 'candlestick']
    const options = { ...data.options, ...COMMON_SERIES_SETTINGS }
    return {
      series: data.series,
      options
    }
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

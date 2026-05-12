import { createChart } from 'lightweight-charts'
import { CHART_PARAMS } from './constants'
import { IndicatorsOverlay } from '@engine/overlays/IndicatorsOverlay'
import { ExpirationOverlay } from '@engine/overlays/ExpirationOverlay'
import { OptionOverlay } from '@engine/overlays/OptionOverlay'
import { PluginOverlay } from '@engine/overlays/PluginOverlay'
import type { IChartApi } from 'lightweight-charts'
import type { ChartExpiration, ChartOption, Datafeed, SeriesId } from '@engine/types'
import type { SeriesOverlay } from '@engine/series/types'
import { seriesOverlayFactory } from '@engine/series/seriesOverlayFactory'
import type { IndicatorScript } from '@engine/indicators/types'
import { INDICATOR_SCRIPTS } from '@engine/indicators'

type Params = {
  datafeed: Datafeed
  seriesId?: SeriesId
}

type Overlays = {
  plugin: PluginOverlay
  opt: OptionOverlay
  exp: ExpirationOverlay
  series: SeriesOverlay
  indicators: IndicatorsOverlay
}

export class PlotEngine {
  #chart: IChartApi
  #datafeed: Datafeed
  #seriesId: SeriesId
  #overlays: Overlays
  #expiration: ChartExpiration | null = null
  #options: ChartOption[] = []

  constructor(el: HTMLElement, params: Params) {
    this.#chart = createChart(el, CHART_PARAMS)
    this.#datafeed = params.datafeed
    this.#seriesId = params.seriesId || 'candlestick'
    this.#overlays = this.#createOverlays()
  }

  setSeriesId(seriesId: SeriesId) {
    this.#destroyOverlays()
    this.#seriesId = seriesId
    this.#overlays = this.#createOverlays()
  }

  async setDatafeed(datafeed: Datafeed) {
    this.#destroyOverlays()
    this.#datafeed = datafeed
    this.#overlays = this.#createOverlays()
  }

  setOptions(options: ChartOption[]) {
    this.#options = options
    this.#overlays.opt.setOptions(options)
  }

  setExpiration(expiration: ChartExpiration) {
    this.#expiration = expiration
    this.#overlays.exp.setExpiration(expiration)
  }

  addIndicator(key: IndicatorScript) {
    const script = INDICATOR_SCRIPTS.find((s) => s.key === key)
    if (!script) {
      throw 'unknown indicator key'
    }

    this.#overlays.indicators.add(new script.indicator(this.#chart, this.#datafeed))
    return 8
  }

  destroy() {
    this.#destroyOverlays()
    this.#chart.remove()
  }

  #destroyOverlays() {
    Object.keys(this.#overlays).forEach((key) => {
      this.#overlays[key as keyof Overlays].destroy()
    })
  }

  #createOverlays() {
    const resolutionId = this.#datafeed.getResolutionId()
    const assetSymbol = this.#datafeed.getAssetSymbol()
    const seriesOverlay = seriesOverlayFactory(this.#seriesId, this.#chart, this.#datafeed)

    const series = seriesOverlay.getSeries()
    const pluginOverlay = new PluginOverlay(this.#chart, series, assetSymbol, resolutionId)
    const indicatorsOverlay = new IndicatorsOverlay()

    const expOverlay = new ExpirationOverlay(this.#chart, series, resolutionId)
    if (this.#expiration) {
      expOverlay.setExpiration(this.#expiration)
    }

    const optOverlay = new OptionOverlay(this.#chart, series, resolutionId)
    if (this.#options) {
      optOverlay.setOptions(this.#options)
    }

    return {
      plugin: pluginOverlay,
      exp: expOverlay,
      indicators: indicatorsOverlay,
      opt: optOverlay,
      series: seriesOverlay
    }
  }
}

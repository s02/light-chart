import { createChart } from 'lightweight-charts'
import { CHART_PARAMS } from './constants'
import { IndicatorsOverlay } from '@engine/overlays/IndicatorsOverlay'
import { ExpirationOverlay } from '@engine/overlays/ExpirationOverlay'
import { OptionOverlay } from '@engine/overlays/OptionOverlay'
import { PluginOverlay } from '@engine/overlays/PluginOverlay'
import { seriesOverlayFactory } from '@engine/series/seriesOverlayFactory'
import type { IChartApi, MouseEventParams } from 'lightweight-charts'
import type {
  ChartExpiration,
  ChartOption,
  ChartSeriesLegend,
  Datafeed,
  SeriesId,
  SeriesOverlay,
  IndicatorScript,
  IndicatorOnPane,
  IndicatorParams
} from '@engine/types'
import { DrawingsOverlay } from '@engine/overlays/DrawingsOverlay'
import type { DrawingName } from '@engine/drawings'

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
  drawings: DrawingsOverlay
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

  subscribeToLegends(cb: (legends: ChartSeriesLegend[]) => void) {
    const handler = (params: MouseEventParams) => {
      const result: ChartSeriesLegend[] = []
      const series = this.#overlays.series.getSeries()
      const data = params.seriesData.get(series)

      if (data) {
        result.push({
          category: 'main',
          id: -1,
          ...this.#overlays.series.getLegend(data)
        })
      }

      const legends = this.#overlays.indicators.getLegends(params.seriesData)
      result.push(...legends)

      if (result.length) {
        cb(result)
      }
    }

    this.#chart.subscribeCrosshairMove(handler)
    return () => this.#chart.unsubscribeCrosshairMove(handler)
  }

  subscribeToDrawings(cb: (id: number) => void) {
    const handler = (ev: PointerEvent) => {}
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

  async addIndicator(key: IndicatorScript): Promise<IndicatorOnPane> {
    const iop = await this.#overlays.indicators.add(key)
    this.#overlays.series.moveToTop()
    return iop
  }

  removeIndicator(id: number) {
    this.#overlays.indicators.remove(id)
  }

  getIndicatorSchema(id: number) {
    return this.#overlays.indicators.getSchema(id)
  }

  updateIndicator(id: number, params: IndicatorParams) {
    this.#overlays.indicators.updateParams(id, params)
  }

  addDrawing(key: DrawingName) {
    return this.#overlays.drawings.add(key)
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
    const seriesOverlay = seriesOverlayFactory(this.#seriesId, this.#chart, this.#datafeed)

    const series = seriesOverlay.getSeries()
    const pluginOverlay = new PluginOverlay(series, resolutionId)
    const indicatorsOverlay = new IndicatorsOverlay(this.#chart, this.#datafeed)
    const drawingsOverlay = new DrawingsOverlay(this.#chart, series)

    const expOverlay = new ExpirationOverlay(this.#chart, series, resolutionId)
    if (this.#expiration) {
      expOverlay.setExpiration(this.#expiration)
    }

    const optOverlay = new OptionOverlay(this.#chart, series, resolutionId)
    if (this.#options) {
      optOverlay.setOptions(this.#options)
    }

    return {
      indicators: indicatorsOverlay,
      plugin: pluginOverlay,
      exp: expOverlay,
      opt: optOverlay,
      series: seriesOverlay,
      drawings: drawingsOverlay
    }
  }
}

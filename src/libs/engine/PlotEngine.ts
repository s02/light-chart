import { createChart } from 'lightweight-charts'
import { CHART_PARAMS } from './constants'
import { IndicatorsOverlay } from '@engine/indicators'
import { seriesOverlayFactory } from '@engine/series'
import { PluginOverlay } from '@engine/plugins'
import type { IChartApi, MouseEventParams } from 'lightweight-charts'
import type { ChartExpiration, ChartOption, Datafeed, IndicatorOnPane, ChartSeriesLegend } from '@engine/types'
import type { SeriesId, SeriesOverlay } from '@engine/series'
import type { IndicatorName, IndicatorParams } from '@engine/indicators'
import { DrawingsManager, type DrawingName } from '@engine/drawings'

type Params = {
  datafeed: Datafeed
  seriesId?: SeriesId
}

export class PlotEngine {
  #chart: IChartApi
  #datafeed: Datafeed
  #seriesId: SeriesId
  #plugins: PluginOverlay
  #seriesOverlay: SeriesOverlay
  #indicators: IndicatorsOverlay
  #drawingsManager: DrawingsManager

  constructor(el: HTMLElement, params: Params) {
    this.#chart = createChart(el, CHART_PARAMS)
    this.#datafeed = params.datafeed
    this.#seriesId = params.seriesId || 'candlestick'

    const series = seriesOverlayFactory(this.#seriesId, this.#chart, this.#datafeed)
    this.#seriesOverlay = series
    this.#indicators = new IndicatorsOverlay(this.#chart, this.#datafeed)
    this.#drawingsManager = new DrawingsManager(this.#chart, this.#seriesOverlay.getSeries())
    this.#plugins = new PluginOverlay(this.#chart, this.#datafeed.getResolutionId())
    this.#plugins.attach(this.#seriesOverlay.getSeries())
  }

  subscribeToLegends(cb: (legends: ChartSeriesLegend[]) => void) {
    const handler = (params: MouseEventParams) => {
      const result: ChartSeriesLegend[] = []
      const series = this.#seriesOverlay.getSeries()
      const data = params.seriesData.get(series)

      if (data) {
        result.push({
          category: 'main',
          id: -1,
          ...this.#seriesOverlay.getLegend(data)
        })
      }

      const legends = this.#indicators.getLegends(params.seriesData)
      result.push(...legends)

      if (result.length) {
        cb(result)
      }
    }

    this.#chart.subscribeCrosshairMove(handler)
    return () => this.#chart.unsubscribeCrosshairMove(handler)
  }

  subscribeToDrawings(_cb: (id: number) => void) {
    //const handler = (ev: PointerEvent) => {}
  }

  setSeriesId(seriesId: SeriesId) {
    this.#seriesId = seriesId
    const series = seriesOverlayFactory(this.#seriesId, this.#chart, this.#datafeed)
    this.#seriesOverlay.destroy()
    this.#seriesOverlay = series

    this.#plugins.setSeries(series.getSeries())
    this.#drawingsManager.setSeries(series.getSeries())
  }

  async setDatafeed(datafeed: Datafeed) {
    this.#datafeed.destroy()
    this.#datafeed = datafeed

    this.#seriesOverlay.setDatafeed(datafeed)
    this.#indicators.setDatafeed(datafeed)
    this.#plugins.setResolution(datafeed.getResolutionId())
  }

  setOptions(options: ChartOption[]) {
    this.#plugins.option.setOptions(options)
  }

  setExpiration(expiration: ChartExpiration) {
    this.#plugins.exp.setExpiration(expiration)
  }

  async addIndicator(key: IndicatorName): Promise<IndicatorOnPane> {
    const iop = await this.#indicators.add(key)
    this.#seriesOverlay.moveToTop()
    return iop
  }

  removeIndicator(id: number) {
    this.#indicators.remove(id)
  }

  getIndicatorSchema(id: number) {
    return this.#indicators.getSchema(id)
  }

  updateIndicator(id: number, params: IndicatorParams) {
    this.#indicators.updateParams(id, params)
  }

  addDrawing(key: DrawingName) {
    return this.#drawingsManager.add(key)
  }

  destroy() {
    this.#plugins.detach()
    this.#indicators.destroy()
    this.#seriesOverlay.destroy()
    this.#chart.remove()
  }
}

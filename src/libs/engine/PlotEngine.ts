import { createChart } from 'lightweight-charts'
import { CHART_PARAMS } from './constants'
import { IndicatorsOverlay } from '@engine/indicators'
import { seriesOverlayFactory } from '@engine/series'
import { PluginOverlay } from '@engine/plugins'
import type { IChartApi, MouseEventParams } from 'lightweight-charts'
import type { ChartExpiration, ChartOption, Datafeed, IndicatorOnPane, ChartSeriesLegend } from '@engine/types'
import type { SeriesId, SeriesOverlay } from '@engine/series'
import type { IndicatorName, IndicatorParams } from '@engine/indicators'
import type { DrawingName } from '@engine/drawings'

type Params = {
  datafeed: Datafeed
  seriesId?: SeriesId
}

export class PlotEngine {
  #chart: IChartApi
  #datafeed: Datafeed
  #seriesId: SeriesId
  #plugins: PluginOverlay
  #series: SeriesOverlay
  #indicators: IndicatorsOverlay

  constructor(el: HTMLElement, params: Params) {
    this.#chart = createChart(el, CHART_PARAMS)
    this.#datafeed = params.datafeed
    this.#seriesId = params.seriesId || 'candlestick'

    const series = seriesOverlayFactory(this.#seriesId, this.#chart, this.#datafeed)
    this.#series = series
    this.#indicators = new IndicatorsOverlay(this.#chart, this.#datafeed)
    this.#plugins = new PluginOverlay(this.#chart, this.#datafeed.getResolutionId())
    this.#plugins.attach(this.#series.getSeries())
  }

  subscribeToLegends(cb: (legends: ChartSeriesLegend[]) => void) {
    const handler = (params: MouseEventParams) => {
      const result: ChartSeriesLegend[] = []
      const series = this.#series.getSeries()
      const data = params.seriesData.get(series)

      if (data) {
        result.push({
          category: 'main',
          id: -1,
          ...this.#series.getLegend(data)
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
    this.#series.destroy()
    this.#series = series

    this.#plugins.setSeries(series.getSeries())
  }

  async setDatafeed(datafeed: Datafeed) {
    this.#datafeed.destroy()
    this.#datafeed = datafeed

    this.#series.setDatafeed(datafeed)
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
    this.#series.moveToTop()
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

  addDrawing(_key: DrawingName) {
    return Promise.resolve(5)
    //return this.#overlays.drawings.add(key)
  }

  destroy() {
    this.#plugins.detach()
    this.#indicators.destroy()
    this.#series.destroy()
    this.#chart.remove()
  }
}

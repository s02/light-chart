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
  IndicatorName,
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
  //drawings: DrawingsOverlay
}

export class PlotEngine {
  #chart: IChartApi
  #datafeed: Datafeed
  #seriesId: SeriesId
  #overlays: Overlays

  constructor(el: HTMLElement, params: Params) {
    this.#chart = createChart(el, CHART_PARAMS)
    this.#datafeed = params.datafeed
    this.#seriesId = params.seriesId || 'candlestick'

    const series = seriesOverlayFactory(this.#seriesId, this.#chart, this.#datafeed)

    this.#overlays = {
      series,
      opt: new OptionOverlay(this.#chart, series.getSeries(), this.#datafeed.getResolutionId()),
      exp: new ExpirationOverlay(this.#chart, series.getSeries(), this.#datafeed.getResolutionId()),
      indicators: new IndicatorsOverlay(this.#chart, this.#datafeed),
      plugin: new PluginOverlay(series.getSeries(), this.#datafeed.getResolutionId())
    }
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
    //const handler = (ev: PointerEvent) => {}
  }

  setSeriesId(seriesId: SeriesId) {
    this.#seriesId = seriesId
    const series = seriesOverlayFactory(this.#seriesId, this.#chart, this.#datafeed)
    this.#overlays.series.destroy()
    this.#overlays.series = series
    this.#overlays.plugin.setSeries(series.getSeries())
    this.#overlays.exp.setSeries(series.getSeries())
    this.#overlays.opt.setSeries(series.getSeries())
  }

  async setDatafeed(datafeed: Datafeed) {
    this.#datafeed.destroy()
    this.#datafeed = datafeed

    this.#overlays.series.setDatafeed(this.#datafeed)
    this.#overlays.indicators.setDatafeed(datafeed)
    this.#overlays.plugin.setResolutionId(datafeed.getResolutionId())
    this.#overlays.exp.setResolutionId(datafeed.getResolutionId())
    this.#overlays.opt.setResolutionId(datafeed.getResolutionId())
  }

  setOptions(options: ChartOption[]) {
    this.#overlays.opt.setOptions(options)
  }

  setExpiration(expiration: ChartExpiration) {
    this.#overlays.exp.setExpiration(expiration)
  }

  async addIndicator(key: IndicatorName): Promise<IndicatorOnPane> {
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
    //return this.#overlays.drawings.add(key)
  }

  destroy() {
    this.#overlays.plugin.destroy()
    this.#overlays.indicators.destroy()
    this.#overlays.exp.destroy()
    this.#overlays.opt.destroy()
    this.#overlays.series.destroy()
    this.#chart.remove()
  }
}

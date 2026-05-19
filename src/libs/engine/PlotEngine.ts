import { createChart } from 'lightweight-charts'
import { CHART_PARAMS, RESOLUTION_SETTINGS } from './constants'
import { IndicatorsManager } from '@engine/indicators'
import { seriesOverlayFactory } from '@engine/series'
import { PluginManager } from '@engine/plugins'
import type { IChartApi, LogicalRange, MouseEventParams } from 'lightweight-charts'
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
  #pluginManager: PluginManager
  #seriesOverlay: SeriesOverlay
  #indicatorsManager: IndicatorsManager
  #drawingsManager: DrawingsManager

  constructor(el: HTMLElement, params: Params) {
    this.#chart = createChart(el, CHART_PARAMS)
    this.#datafeed = params.datafeed
    this.#seriesId = params.seriesId || 'candlestick'

    this.#seriesOverlay = seriesOverlayFactory(this.#seriesId, this.#chart, this.#datafeed)
    this.#indicatorsManager = new IndicatorsManager(this.#chart, this.#datafeed)
    this.#drawingsManager = new DrawingsManager(this.#chart, this.#seriesOverlay.getSeries())
    this.#pluginManager = new PluginManager(this.#chart, this.#datafeed.getResolutionId())
    this.#pluginManager.attach(this.#seriesOverlay.getSeries())

    this.#chart.timeScale().subscribeVisibleLogicalRangeChange(this.#rangeChangeHandler)
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

      const legends = this.#indicatorsManager.getLegends(params.seriesData)
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

    this.#pluginManager.setSeries(series.getSeries())
    this.#drawingsManager.setSeries(series.getSeries())
  }

  async setDatafeed(datafeed: Datafeed) {
    this.#datafeed.destroy()
    this.#datafeed = datafeed

    this.#seriesOverlay.setDatafeed(datafeed)
    this.#indicatorsManager.setDatafeed(datafeed)
    this.#pluginManager.setResolution(datafeed.getResolutionId())
  }

  setOptions(options: ChartOption[]) {
    this.#pluginManager.option.setOptions(options)
  }

  setExpiration(expiration: ChartExpiration) {
    this.#pluginManager.exp.setExpiration(expiration)
  }

  async addIndicator(key: IndicatorName): Promise<IndicatorOnPane> {
    const iop = await this.#indicatorsManager.add(key)
    this.#seriesOverlay.moveToTop()
    return iop
  }

  removeIndicator(id: number) {
    this.#indicatorsManager.remove(id)
  }

  getIndicatorSchema(id: number) {
    return this.#indicatorsManager.getSchema(id)
  }

  updateIndicator(id: number, params: IndicatorParams) {
    this.#indicatorsManager.updateParams(id, params)
  }

  addDrawing(key: DrawingName) {
    return this.#drawingsManager.add(key)
  }

  destroy() {
    this.#pluginManager.detach()
    this.#indicatorsManager.destroy()
    this.#seriesOverlay.destroy()
    this.#chart.timeScale().unsubscribeVisibleLogicalRangeChange(this.#rangeChangeHandler)
    this.#chart.remove()
  }

  #rangeChangeHandler = (range: LogicalRange | null) => {
    if (!range || range.from >= 10) {
      return
    }

    const timeRange = this.#chart.timeScale().getVisibleRange()

    if (!timeRange?.from || !timeRange?.to) {
      return
    }

    const resolution = RESOLUTION_SETTINGS[this.#datafeed.getResolutionId()]
    const diff = (timeRange.to as number) - (timeRange.from as number)
    const candlesCount = Math.round(diff / resolution.seconds)

    this.#datafeed.loadHistory({ minCandles: candlesCount })
  }
}

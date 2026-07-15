import { createChart } from 'lightweight-charts'
import { CHART_PARAMS, RESOLUTION_SETTINGS } from './constants'
import { IndicatorsManager } from '@engine/indicators'
import { seriesOverlayFactory } from '@engine/series'
import { PluginManager } from '@engine/plugins'
import { WhitespaceSeries } from './series/WhitespaceSeries'
import { LegendsManager } from '@engine/legends/LegendsManager'
import type { IChartApi, LogicalRange } from 'lightweight-charts'
import type {
  ChartExpiration,
  ChartOption,
  Datafeed,
  IndicatorOnPane,
  ChartSeriesLegend,
  ResolutionId
} from '@engine/types'
import type { SeriesId, SeriesOverlay } from '@engine/series'
import type { IndicatorName } from '@engine/indicators'
import { DrawingsManager } from '@engine/drawings'
import type { DrawingName, DrawingOptions, DrawingSelectFn } from '@engine/drawings/types'
import type { StudyParams } from '@engine/schema'
import type { Anchor } from '@engine/points'

type Params = {
  datafeed: Datafeed
  seriesId?: SeriesId
}

type PlotEvent =
  | {
      type: 'resolutionChanged'
      data: ResolutionId
    }
  | {
      type: 'seriesChanged'
      data: SeriesId
    }

export class PlotEngine {
  #chart: IChartApi
  #datafeed: Datafeed
  #seriesId: SeriesId
  #pluginManager: PluginManager
  #seriesOverlay: SeriesOverlay
  #indicatorsManager: IndicatorsManager
  #drawingsManager: DrawingsManager
  #legendsManager: LegendsManager
  #whitespace: WhitespaceSeries
  #subscribers: Array<(event: PlotEvent) => void> = []

  constructor(el: HTMLElement, params: Params) {
    this.#chart = createChart(el, CHART_PARAMS)
    this.#datafeed = params.datafeed
    this.#seriesId = params.seriesId || 'candlestick'

    this.#seriesOverlay = seriesOverlayFactory(this.#seriesId, this.#chart, this.#datafeed)
    this.#indicatorsManager = new IndicatorsManager(this.#chart, this.#datafeed)
    this.#drawingsManager = new DrawingsManager(this.#chart, this.#seriesOverlay.getSeries())
    this.#legendsManager = new LegendsManager(this.#chart, this.#seriesOverlay, this.#indicatorsManager)
    this.#pluginManager = new PluginManager(this.#chart, this.#datafeed.getResolutionId())
    this.#pluginManager.attach(this.#seriesOverlay.getSeries())
    this.#whitespace = new WhitespaceSeries(this.#chart, this.#datafeed)

    this.#chart.timeScale().subscribeVisibleLogicalRangeChange(this.#rangeChangeHandler)
    console.log(`%c[Plot Engine: started]`, 'background: #90ac12; color:#fff')
  }

  subscribe(cb: (event: PlotEvent) => void) {
    this.#subscribers.push(cb)
  }

  unsubscribe(cb: (event: PlotEvent) => void) {
    this.#subscribers = this.#subscribers.filter((sub) => sub !== cb)
  }

  get ready() {
    return this.#seriesOverlay.ready
  }

  subscribeToLegends(cb: (legends: ChartSeriesLegend[]) => void) {
    return this.#legendsManager.subscribe(cb)
  }

  subscribeToSelectDrawing(cb: DrawingSelectFn) {
    this.#drawingsManager.subscribe(cb)
  }

  setSeriesId(seriesId: SeriesId) {
    this.#seriesId = seriesId
    const series = seriesOverlayFactory(this.#seriesId, this.#chart, this.#datafeed)
    this.#seriesOverlay.destroy()
    this.#seriesOverlay = series

    this.#pluginManager.setSeries(series.getSeries())
    this.#drawingsManager.setSeries(series.getSeries())
    this.#legendsManager.setSeriesOverlay(series)

    this.#subscribers.forEach((sub) => {
      sub({ type: 'seriesChanged', data: seriesId })
    })
  }

  async setDatafeed(datafeed: Datafeed) {
    this.#datafeed.destroy()
    this.#datafeed = datafeed

    this.#seriesOverlay.setDatafeed(datafeed)
    this.#indicatorsManager.setDatafeed(datafeed)
    this.#pluginManager.setResolution(datafeed.getResolutionId())
    this.#whitespace.setDatafeed(datafeed)

    this.#subscribers.forEach((sub) => {
      sub({ type: 'resolutionChanged', data: datafeed.getResolutionId() })
    })
  }

  setOptions(options: ChartOption[]) {
    this.#pluginManager.option.setOptions(options)
  }

  setExpiration(expiration?: ChartExpiration) {
    this.#pluginManager.exp.setExpiration(expiration)
  }

  setExpirationOffset(offset?: number) {
    this.#pluginManager.exp.setOffset(offset)
  }

  clearStudies() {
    this.#indicatorsManager.clear()
  }

  clearDrawings() {
    this.#drawingsManager.clear()
  }

  async addIndicator(key: IndicatorName, params?: StudyParams): Promise<IndicatorOnPane> {
    const iop = await this.#indicatorsManager.add(key, params)
    this.#seriesOverlay.moveToTop()
    return iop
  }

  removeIndicator(id: number) {
    this.#indicatorsManager.remove(id)
  }

  getIndicatorSchema(id: number) {
    return this.#indicatorsManager.getSchema(id)
  }

  updateIndicator(id: number, params: StudyParams) {
    this.#indicatorsManager.updateParams(id, params)
  }

  addDrawing(key: DrawingName, options: DrawingOptions, anchors: Anchor[]) {
    return this.#drawingsManager.add(key, options, anchors)
  }

  initDrawing(key: DrawingName, options?: DrawingOptions) {
    return this.#drawingsManager.init(key, options)
  }

  updateDrawing(id: number, params: StudyParams) {
    this.#drawingsManager.updateParams(id, params)
  }

  removeDrawing(id: number) {
    this.#drawingsManager.remove(id)
  }

  cancelDrawing() {
    this.#drawingsManager.cancelCurrent()
  }

  getStudiesLayout() {
    return {
      indicators: this.#indicatorsManager.getAllSchemas(),
      drawings: this.#drawingsManager.getAllSchemas()
    }
  }

  destroy() {
    this.#whitespace.destroy()
    this.#pluginManager.detach()
    this.#indicatorsManager.clear()
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

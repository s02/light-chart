import { OptionPlugin } from './OptionPlugin'
import type { IChartApi, ISeriesApi, ISeriesPrimitive, SeriesType, Time } from 'lightweight-charts'
import type { ChartOption, ResolutionId } from '@engine/types'

export class OptionOverlay {
  #resolutionId: ResolutionId
  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #shapes: ISeriesPrimitive<Time>[] = []
  #options: ChartOption[] = []

  constructor(chart: IChartApi, series: ISeriesApi<SeriesType>, resolutionId: ResolutionId) {
    this.#chart = chart
    this.#series = series
    this.#resolutionId = resolutionId
  }

  clear() {
    this.#shapes.forEach((shape) => this.#series.detachPrimitive(shape))
  }

  setResolution(resolutionId: ResolutionId) {
    this.#resolutionId = resolutionId
    this.#redraw()
  }

  setSeries(series: ISeriesApi<SeriesType>) {
    this.#series = series
    this.#redraw()
  }

  setOptions(options: ChartOption[]) {
    this.#options = options
    this.#redraw()
  }

  #redraw() {
    this.clear()
    this.#shapes = this.#createShapes()
    this.#shapes.forEach((shape) => this.#series.attachPrimitive(shape))
  }

  #createShapes() {
    return this.#options.map((option) => new OptionPlugin(this.#chart, option, this.#resolutionId))
  }
}

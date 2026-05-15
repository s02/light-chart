import type { Drawing } from '@engine/drawings/Drawing'
import type { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts'

export class DrawingsOverlay {
  #chart: IChartApi
  #series: ISeriesApi<SeriesType>

  constructor(chart: IChartApi, series: ISeriesApi<SeriesType>) {
    this.#chart = chart
    this.#series = series
  }

  add(drawing: Drawing) {
    drawing.attach(this.#series, this.#chart)
  }

  destroy() {}
}

import { ExpirationPlugin } from './ExpirationPlugin'
import type { ChartExpiration, ResolutionId } from '@engine/types'
import type { IChartApi, ISeriesApi, ISeriesPrimitive, SeriesType, Time } from 'lightweight-charts'

export class ExpirationOverlay {
  #resolutionId: ResolutionId
  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #expiration?: ChartExpiration
  #shape?: ISeriesPrimitive<Time>

  constructor(chart: IChartApi, series: ISeriesApi<SeriesType>, resolutionId: ResolutionId) {
    this.#chart = chart
    this.#resolutionId = resolutionId
    this.#series = series
  }

  setResolution(resolutionId: ResolutionId) {
    this.#resolutionId = resolutionId
    this.#redraw()
  }

  setSeries(series: ISeriesApi<SeriesType>) {
    this.#series = series
    this.#redraw()
  }

  setExpiration(expiration: ChartExpiration) {
    this.#expiration = expiration
    this.#redraw()
  }

  destroy() {
    if (this.#shape) {
      this.#series.detachPrimitive(this.#shape)
    }
  }

  #redraw() {
    if (this.#shape) {
      this.#series.detachPrimitive(this.#shape)
    }

    this.#shape = this.#createShape()

    if (this.#shape) {
      this.#series.attachPrimitive(this.#shape)
    }
  }

  #createShape() {
    if (this.#expiration) {
      return new ExpirationPlugin(this.#chart, this.#expiration, this.#resolutionId)
    }

    return undefined
  }
}

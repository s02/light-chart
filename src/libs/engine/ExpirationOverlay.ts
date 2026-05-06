import { ExpirationPlugin } from './ExpirationPlugin'
import type { ChartExpiration, ResolutionId } from '@engine/types'
import type { IChartApi, ISeriesApi, ISeriesPrimitive, SeriesType, Time } from 'lightweight-charts'

export class ExpirationOverlay {
  #resolutionId: ResolutionId
  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #expiration: ChartExpiration | null = null
  #shape: ISeriesPrimitive<Time> | null = null

  constructor(chart: IChartApi, series: ISeriesApi<SeriesType>, resolutionId: ResolutionId) {
    this.#chart = chart
    this.#resolutionId = resolutionId
    this.#series = series
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
    this.destroy()
    this.#shape = this.#createShape()

    if (this.#shape) {
      this.#series.attachPrimitive(this.#shape)
    }
  }

  #createShape() {
    if (this.#expiration) {
      return new ExpirationPlugin(this.#chart, this.#expiration, this.#resolutionId)
    }

    return null
  }
}

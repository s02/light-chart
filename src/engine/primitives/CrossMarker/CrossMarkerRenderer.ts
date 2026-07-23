import { cross } from '@engine/primitives/cross'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IChartApi, IPrimitivePaneRenderer, ISeriesApi, SeriesType, Time } from 'lightweight-charts'

export type CrossPoint = {
  time: Time
  price: number
  color: string
}

export class CrossMarkerRenderer implements IPrimitivePaneRenderer {
  #points: CrossPoint[]
  #chart: IChartApi
  #series: ISeriesApi<SeriesType>

  constructor(points: CrossPoint[], chart: IChartApi, series: ISeriesApi<SeriesType>) {
    this.#points = points
    this.#chart = chart
    this.#series = series
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const timeScale = this.#chart.timeScale()

      for (const point of this.#points) {
        const x = timeScale.timeToCoordinate(point.time)
        const y = this.#series.priceToCoordinate(point.price)
        if (x === null || y === null) continue

        cross(scope, { x, y }, { size: 5, color: point.color, lineWidth: 4 })
      }
    })
  }
}

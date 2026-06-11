import { cloudFill } from '@engine/primitives/cloud-fill'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IChartApi, IPrimitivePaneRenderer, ISeriesApi, Point, SeriesType, Time } from 'lightweight-charts'

export type FillPoint = { time: Time; upper: number; lower: number }

export class IchimokuCloudFillRenderer implements IPrimitivePaneRenderer {
  #points: FillPoint[]
  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #bull: string
  #bear: string

  constructor(points: FillPoint[], chart: IChartApi, series: ISeriesApi<SeriesType>, bull: string, bear: string) {
    this.#points = points
    this.#chart = chart
    this.#series = series
    this.#bull = bull
    this.#bear = bear
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const timeScale = this.#chart.timeScale()
      const upper: Point[] = []
      const lower: Point[] = []

      for (const point of this.#points) {
        const x = timeScale.timeToCoordinate(point.time)
        const yU = this.#series.priceToCoordinate(point.upper)
        const yL = this.#series.priceToCoordinate(point.lower)
        if (x && yU && yL) {
          upper.push({ x, y: yU })
          lower.push({ x, y: yL })
        }
      }

      cloudFill(scope, upper, lower, { bull: this.#bull, bear: this.#bear })
    })
  }
}

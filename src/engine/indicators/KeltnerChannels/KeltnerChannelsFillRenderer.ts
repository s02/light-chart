import { channelFill } from '@engine/primitives/channel-fill'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IChartApi, IPrimitivePaneRenderer, ISeriesApi, Point, SeriesType, Time } from 'lightweight-charts'

export type FillPoint = { time: Time; upper: number; lower: number }

export class KeltnerChannelsFillRenderer implements IPrimitivePaneRenderer {
  #points: FillPoint[]
  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #fill: string

  constructor(points: FillPoint[], chart: IChartApi, series: ISeriesApi<SeriesType>, fill: string) {
    this.#points = points
    this.#chart = chart
    this.#series = series
    this.#fill = fill
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

      channelFill(scope, upper, lower, { fill: this.#fill })
    })
  }
}

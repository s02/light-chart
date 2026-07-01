import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IChartApi, IPrimitivePaneRenderer, ISeriesApi, SeriesType, Time } from 'lightweight-charts'

export type FillPoint = { time: Time; upper: number; lower: number }

export class DonchianChannelsFillRenderer implements IPrimitivePaneRenderer {
  #points: FillPoint[]
  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #color: string

  constructor(points: FillPoint[], chart: IChartApi, series: ISeriesApi<SeriesType>, color: string) {
    this.#points = points
    this.#chart = chart
    this.#series = series
    this.#color = color
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace(({ context: ctx, horizontalPixelRatio: hpr, verticalPixelRatio: vpr }) => {
      const timeScale = this.#chart.timeScale()
      const pts: { x: number; yU: number; yL: number }[] = []

      for (const point of this.#points) {
        const x = timeScale.timeToCoordinate(point.time)
        const yU = this.#series.priceToCoordinate(point.upper)
        const yL = this.#series.priceToCoordinate(point.lower)
        if (x === null || yU === null || yL === null) continue
        pts.push({ x: x * hpr, yU: yU * vpr, yL: yL * vpr })
      }

      if (pts.length < 2) return

      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].yU)
      for (const p of pts) ctx.lineTo(p.x, p.yU)
      for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i].x, pts[i].yL)
      ctx.closePath()
      ctx.fillStyle = this.#color
      ctx.fill()
    })
  }
}

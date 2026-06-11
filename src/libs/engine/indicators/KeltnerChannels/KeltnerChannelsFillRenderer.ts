import type { KCParams } from '@engine/indicators/KeltnerChannels/KeltnerChannels'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IChartApi, IPrimitivePaneRenderer, ISeriesApi, SeriesType, Time } from 'lightweight-charts'

export type FillPoint = { time: Time; upper: number; lower: number }

export class KeltnerChannelsFillRenderer implements IPrimitivePaneRenderer {
  #points: FillPoint[]
  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #params: KCParams

  constructor(points: FillPoint[], chart: IChartApi, series: ISeriesApi<SeriesType>, params: KCParams) {
    this.#points = points
    this.#chart = chart
    this.#series = series
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace(({ context: ctx, horizontalPixelRatio: hpr, verticalPixelRatio: vpr }) => {
      const timeScale = this.#chart.timeScale()
      const pts: { x: number; yU: number; yL: number }[] = []

      for (let i = 0; i < this.#points.length; i++) {
        const x = timeScale.timeToCoordinate(this.#points[i].time)
        const yU = this.#series.priceToCoordinate(this.#points[i].upper)
        const yL = this.#series.priceToCoordinate(this.#points[i].lower)
        if (x === null || yU === null || yL === null) continue
        pts.push({ x: x * hpr, yU: yU * vpr, yL: yL * vpr })
      }

      if (pts.length < 2) return

      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].yU)

      for (const p of pts) {
        ctx.lineTo(p.x, p.yU)
      }

      for (let i = pts.length - 1; i >= 0; i--) {
        ctx.lineTo(pts[i].x, pts[i].yL)
      }

      ctx.closePath()
      ctx.fillStyle = this.#params.fill
      ctx.fill()
    })
  }
}

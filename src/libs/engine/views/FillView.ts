import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type {
  IChartApi,
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  ISeriesApi,
  ISeriesPrimitive,
  SeriesAttachedParameter,
  SeriesType,
  Time
} from 'lightweight-charts'

export type FillPoint = { time: Time; upper: number; lower: number }

class FillRenderer implements IPrimitivePaneRenderer {
  #points: FillPoint[]
  #chart: IChartApi
  #series: ISeriesApi<SeriesType>

  constructor(points: FillPoint[], chart: IChartApi, series: ISeriesApi<SeriesType>) {
    this.#points = points
    this.#chart = chart
    this.#series = series
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
      ctx.fillStyle = 'rgba(41, 98, 255, 0.05)'
      ctx.fill()
    })
  }
}

class FillPaneView implements IPrimitivePaneView {
  #primitive: FillViewPrimitive

  constructor(primitive: FillViewPrimitive) {
    this.#primitive = primitive
  }

  zOrder() {
    return 'bottom' as const
  }

  renderer() {
    const { chart, series, points } = this.#primitive
    if (!chart || !series) return null
    return new FillRenderer(points, chart, series)
  }
}

export class FillViewPrimitive implements ISeriesPrimitive<Time> {
  chart: IChartApi | null = null
  series: ISeriesApi<SeriesType> | null = null
  points: FillPoint[] = []

  #view = new FillPaneView(this)

  attached(param: SeriesAttachedParameter<Time>) {
    this.chart = param.chart
    this.series = param.series
  }

  detached() {
    this.chart = null
    this.series = null
  }

  set(points: FillPoint[]) {
    this.points = points
  }

  update(point: FillPoint) {
    if (this.points.length && this.points[this.points.length - 1].time === point.time) {
      this.points[this.points.length - 1] = point
    } else {
      this.points.push(point)
    }
  }

  paneViews() {
    return [this.#view]
  }
}

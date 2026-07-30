import { POINTS_MODE, type Anchor, type PointsHandler, type PointsManager } from '@engine/points'
import type { IChartApi, ISeriesApi, Point, SeriesType } from 'lightweight-charts'

const TAP_THRESHOLD = 10

export class MobilePointsCollector implements PointsManager {
  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #points: (Anchor & Point)[] = []
  #limit: number
  #handler: PointsHandler | null = null
  #el: HTMLElement

  #downPoint: { x: number; y: number } | null = null
  #dragging = false
  #slidSinceCommit = false

  constructor(chart: IChartApi, series: ISeriesApi<SeriesType>, limit: number) {
    this.#chart = chart
    this.#series = series
    this.#limit = limit
    this.#el = this.#chart.chartElement()
  }

  subscribe(handler: PointsHandler) {
    if (this.#handler) {
      throw new Error('MobilePointsCollector: already subscribed')
    }

    this.#handler = handler
    this.#chart.applyOptions({ handleScroll: false, handleScale: false })
    this.#el.addEventListener('pointerdown', this.#pointerdownHandler)
    this.#el.addEventListener('pointermove', this.#pointermoveHandler)
    this.#el.addEventListener('pointerup', this.#pointerupHandler)
    this.#el.addEventListener('pointercancel', this.#pointercancelHandler)
  }

  #pointerdownHandler = (e: PointerEvent) => {
    e.preventDefault()
    this.#downPoint = { x: e.clientX, y: e.clientY }
    this.#dragging = false
  }

  #pointermoveHandler = (e: PointerEvent) => {
    if (!this.#downPoint || !this.#handler) {
      return
    }

    e.preventDefault()

    if (!this.#dragging) {
      const dx = e.clientX - this.#downPoint.x
      const dy = e.clientY - this.#downPoint.y

      if (Math.hypot(dx, dy) < TAP_THRESHOLD) {
        return
      }

      this.#dragging = true
      this.#slidSinceCommit = true
    }

    if (!this.#points.length) {
      return
    }

    const point = this.#resolvePoint(e)
    if (!point) {
      return
    }

    this.#points[this.#points.length - 1] = point
    this.#handler({ status: 'pending', points: this.#filterPoints(this.#points) })
  }

  #pointerupHandler = (e: PointerEvent) => {
    e.preventDefault()

    const wasDragging = this.#dragging
    this.#downPoint = null
    this.#dragging = false

    if (wasDragging || !this.#handler) {
      return
    }

    if (!this.#points.length) {
      const point = this.#resolvePoint(e)
      if (point) {
        this.#commit(point)
      }
      return
    }

    if (!this.#slidSinceCommit && this.#limit === POINTS_MODE.INF) {
      this.#finish()
      return
    }

    const point = this.#resolvePoint(e)
    if (point) {
      this.#commit(point)
    }
  }

  #pointercancelHandler = () => {
    this.#downPoint = null
    this.#dragging = false
  }

  #commit(point: Anchor & Point) {
    if (!this.#handler) {
      return
    }

    if (!this.#points.length) {
      this.#points.push(point)
    } else {
      this.#points[this.#points.length - 1] = point
    }

    this.#slidSinceCommit = false

    const points = this.#filterPoints(this.#points)
    const status = points.length === this.#limit ? 'done' : 'pending'
    this.#handler({ status, points })

    if (status === 'done') {
      this.destroy()
    } else {
      this.#points.push(point)
    }
  }

  #finish() {
    if (!this.#handler) {
      return
    }

    this.#handler({ status: 'done', points: this.#filterPoints(this.#points) })
    this.destroy()
  }

  #resolvePoint(e: PointerEvent): (Anchor & Point) | null {
    const rect = this.#el.getBoundingClientRect()
    const { width, height } = this.#chart.paneSize()

    const point = {
      x: Math.max(0, Math.min(width, e.clientX - rect.left)),
      y: Math.max(0, Math.min(height, e.clientY - rect.top))
    } as Point

    const time = this.#chart.timeScale().coordinateToTime(point.x)
    const price = this.#series.coordinateToPrice(point.y)

    if (!time || !price) {
      return null
    }

    return { x: point.x, y: point.y, price: price as number, time }
  }

  #filterPoints(points: (Anchor & Point)[]) {
    const result: (Anchor & Point)[] = []

    for (let i = 0; i < points.length; i++) {
      const currentPoint = points[i]

      if (result.length) {
        if (!this.#isEqualAnchors(currentPoint, result[result.length - 1])) {
          result.push(currentPoint)
        }
      } else {
        result.push(currentPoint)
      }
    }

    return result
  }

  #isEqualAnchors(p1: Anchor, p2: Anchor) {
    return p1.price === p2.price && p1.time === p2.time
  }

  destroy() {
    this.#chart.applyOptions({ handleScroll: true, handleScale: true })
    this.#el.removeEventListener('pointerdown', this.#pointerdownHandler)
    this.#el.removeEventListener('pointermove', this.#pointermoveHandler)
    this.#el.removeEventListener('pointerup', this.#pointerupHandler)
    this.#el.removeEventListener('pointercancel', this.#pointercancelHandler)
    this.#handler = null
  }
}

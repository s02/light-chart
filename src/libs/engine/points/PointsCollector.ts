import { POINTS_MODE, type Anchor, type PointsHandler, type PointsManager } from '@engine/points'
import type { IChartApi, ISeriesApi, Point, SeriesType } from 'lightweight-charts'

export class PointsCollector implements PointsManager {
  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #points: (Anchor & Point)[] = []
  #limit: number
  #handler: PointsHandler | null = null
  #currentPoint: (Anchor & Point) | null = null
  #el: HTMLElement

  constructor(chart: IChartApi, series: ISeriesApi<SeriesType>, limit: number) {
    this.#chart = chart
    this.#series = series
    this.#limit = limit
    this.#el = this.#chart.chartElement()
  }

  subscribe(handler: PointsHandler) {
    if (this.#handler) {
      throw new Error('Points Collector: already subscribed')
    }

    this.#handler = handler
    this.#el.addEventListener('mousemove', this.#mousemoveHandler)
    this.#el.addEventListener('click', this.#clickHandler)
    this.#el.addEventListener('dblclick', this.#dblClickHandler)
  }

  #mousemoveHandler = (e: MouseEvent) => {
    const rect = this.#el.getBoundingClientRect()
    const { width, height } = this.#chart.paneSize()

    const point = {
      x: Math.max(0, Math.min(width, e.clientX - rect.left)),
      y: Math.max(0, Math.min(height, e.clientY - rect.top))
    } as Point

    const time = this.#chart.timeScale().coordinateToTime(point.x)
    const price = this.#series.coordinateToPrice(point.y)

    if (!time || !price) {
      return
    }

    this.#currentPoint = {
      x: point.x,
      y: point.y,
      price: price as number,
      time
    }

    if (this.#points.length && this.#handler) {
      this.#points[this.#points.length - 1] = this.#currentPoint
      this.#handler({ status: 'pending', points: this.#filterPoints(this.#points) })
    }
  }

  #clickHandler = () => {
    if (!this.#currentPoint || !this.#handler) {
      return
    }

    if (!this.#points.length) {
      this.#points.push(this.#currentPoint)
    }

    const status = this.#points.length === this.#limit ? 'done' : 'pending'
    this.#handler({ status, points: this.#filterPoints(this.#points) })

    if (status === 'done') {
      this.destroy()
    } else {
      this.#points.push(this.#currentPoint)
    }
  }

  #dblClickHandler = () => {
    if (this.#limit !== POINTS_MODE.INF || !this.#handler) {
      return
    }

    this.#handler({ status: 'done', points: this.#filterPoints(this.#points) })
    this.destroy()
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
    this.#el.removeEventListener('mousemove', this.#mousemoveHandler)
    this.#el.removeEventListener('click', this.#clickHandler)
    this.#el.removeEventListener('dblclick', this.#dblClickHandler)
    this.#handler = null
  }
}

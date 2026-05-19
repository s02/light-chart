import type { Anchor } from '@engine/drawings/types'
import type { IChartApi, ISeriesApi, Point, SeriesType, Time } from 'lightweight-charts'

type PointsCollectingStatus = 'pending' | 'done'

type PointsHandler = (params: { status: PointsCollectingStatus; points: (Point & Anchor)[] }) => void

export class PointsCollector {
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
      throw 'Points Collector: already subscribed'
    }

    this.#handler = handler
    this.#el.addEventListener('mousemove', this.#mousemoveHandler)
    this.#el.addEventListener('click', this.#clickHandler)
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
      this.#handler({ status: 'pending', points: this.#points })
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
    this.#handler({ status, points: this.#points })

    if (status === 'done') {
      this.#el.removeEventListener('mousemove', this.#mousemoveHandler)
      this.#el.removeEventListener('click', this.#clickHandler)
    } else {
      this.#points.push(this.#currentPoint)
    }
  }
}

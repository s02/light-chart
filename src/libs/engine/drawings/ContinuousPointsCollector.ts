import type { Anchor } from '@engine/drawings/types'
import type { IChartApi, ISeriesApi, Point, SeriesType } from 'lightweight-charts'
import type { PointsHandler } from './PointsCollector'

export const CONTINUOUS_POINTS_MODE = -2

export class ContinuousPointsCollector {
  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #points: (Anchor & Point)[] = []
  #handler: PointsHandler | null = null
  #recording = false
  #el: HTMLElement

  constructor(chart: IChartApi, series: ISeriesApi<SeriesType>) {
    this.#chart = chart
    this.#series = series
    this.#el = this.#chart.chartElement()
  }

  subscribe(handler: PointsHandler) {
    if (this.#handler) {
      throw new Error('ContinuousPointsCollector: already subscribed')
    }

    this.#handler = handler
    this.#el.addEventListener('mousedown', this.#mousedownHandler)
    this.#el.addEventListener('mousemove', this.#mousemoveHandler)
    this.#el.addEventListener('mouseup', this.#mouseupHandler)
  }

  #mousedownHandler = (e: MouseEvent) => {
    e.preventDefault()
    if (!this.#handler) return
    const p = this.#resolvePoint(e)
    if (!p) return
    this.#recording = true
    this.#chart.applyOptions({ handleScroll: false })
    this.#points = [p]
    this.#handler({ status: 'pending', points: [p] })
  }

  #mousemoveHandler = (e: MouseEvent) => {
    e.preventDefault()
    if (!this.#recording || !this.#handler) return
    const p = this.#resolvePoint(e)
    if (!p) return
    this.#points.push(p)
    this.#handler({ status: 'pending', points: this.#filterPoints(this.#points) })
  }

  #mouseupHandler = (e: MouseEvent) => {
    e.preventDefault()
    if (!this.#recording || !this.#handler) return
    this.#recording = false
    this.#chart.applyOptions({ handleScroll: true })
    this.#handler({ status: 'done', points: this.#filterPoints(this.#points) })
    this.destroy()
  }

  #resolvePoint(e: MouseEvent): (Anchor & Point) | null {
    const rect = this.#el.getBoundingClientRect()
    const { width, height } = this.#chart.paneSize()

    const point = {
      x: Math.max(0, Math.min(width, e.clientX - rect.left)),
      y: Math.max(0, Math.min(height, e.clientY - rect.top))
    } as Point

    const time = this.#chart.timeScale().coordinateToTime(point.x)
    const price = this.#series.coordinateToPrice(point.y)

    if (!time || !price) return null

    return { x: point.x, y: point.y, price: price as number, time }
  }

  #filterPoints(points: (Anchor & Point)[]) {
    const result: (Anchor & Point)[] = []

    for (const p of points) {
      if (!result.length || result[result.length - 1].price !== p.price || result[result.length - 1].time !== p.time) {
        result.push(p)
      }
    }

    return result
  }

  destroy() {
    if (this.#recording) {
      this.#chart.applyOptions({ handleScroll: true })
      this.#recording = false
    }
    this.#el.removeEventListener('mousedown', this.#mousedownHandler)
    this.#el.removeEventListener('mousemove', this.#mousemoveHandler)
    this.#el.removeEventListener('mouseup', this.#mouseupHandler)
    this.#handler = null
  }
}

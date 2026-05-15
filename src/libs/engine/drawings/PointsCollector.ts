import type { Anchor } from '@engine/drawings/types'
import type { Coordinate, IChartApi, ISeriesApi, Point, SeriesType, Time } from 'lightweight-charts'

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

    const handleMouseMove = (ev: MouseEvent) => {
      const x: Coordinate = ev.layerX as Coordinate
      const y: Coordinate = ev.layerY as Coordinate

      this.#currentPoint = {
        x,
        y,
        price: this.#series.coordinateToPrice(y) as number,
        time: this.#chart.timeScale().coordinateToTime(x) as Time
      }

      if (this.#points.length && this.#handler) {
        this.#points[this.#points.length - 1] = this.#currentPoint
        this.#handler({ status: 'pending', points: this.#points })
      }
    }

    const handleClick = () => {
      if (!this.#currentPoint || !this.#handler) {
        return
      }

      if (!this.#points.length) {
        this.#points.push(this.#currentPoint)
      }

      const status = this.#points.length === this.#limit ? 'done' : 'pending'
      this.#handler({ status, points: this.#points })

      if (status === 'done') {
        this.#el.removeEventListener('mousemove', handleMouseMove)
        this.#el.removeEventListener('click', handleClick)
      } else {
        this.#points.push(this.#currentPoint)
      }
    }

    this.#handler = handler
    this.#el.addEventListener('mousemove', handleMouseMove)
    this.#el.addEventListener('click', handleClick)
  }
}

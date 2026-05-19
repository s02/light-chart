import { DRAWINGS } from '@engine/drawings'
import { PointsCollector } from './PointsCollector'
import type { IChartApi, ISeriesApi, Point, SeriesType } from 'lightweight-charts'
import type { BaseDrawing } from './BaseDrawing'
import type { DrawingName } from './types'

export class DrawingsOverlay {
  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #drawings: { id: number; drawing: BaseDrawing }[] = []
  #id = 10
  #chartElement: HTMLDivElement

  constructor(chart: IChartApi, series: ISeriesApi<SeriesType>) {
    this.#chart = chart
    this.#series = series
    this.#chartElement = this.#chart.chartElement()
    this.#chartElement.addEventListener('click', this.#clickHandler)
  }

  add(name: DrawingName): Promise<number> {
    const script = DRAWINGS.find((d) => d.drawing.ikey === name)
    if (!script) {
      throw 'unknown drawing key'
    }

    const drawing = new script.drawing()
    drawing.attach(this.#series, this.#chart)

    return new Promise((resolve) => {
      const pc = new PointsCollector(this.#chart, this.#series, script.drawing.points)
      pc.subscribe((params) => {
        drawing.setAnchors(params.points)
        if (params.status === 'done') {
          const id = this.#id++
          this.#drawings.push({
            id,
            drawing
          })
          resolve(id)
        }
      })
    })
  }

  select(id: number) {
    console.log('select', id)
  }

  destroy() {
    this.#chartElement.removeEventListener('click', this.#clickHandler)
  }

  #clickHandler = ({ layerX: x, layerY: y }: MouseEvent) => {
    this.#drawings.forEach((el) => {
      el.drawing.checkTap({ x, y } as Point)
    })
  }
}

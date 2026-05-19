import { DRAWINGS } from '@engine/drawings'
import { PointsCollector } from './PointsCollector'
import { DrawingDragHandler } from '@engine/drawings/DrawingDragHandler'
import { DrawingSelectHandler } from '@engine/drawings/DrawingSelectHandler'
import type { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts'
import type { BaseDrawing } from './BaseDrawing'
import type { DrawingName } from './types'

export class DrawingsManager {
  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #drawings: { id: number; drawing: BaseDrawing }[] = []
  #id = 10
  #dragHandler: DrawingDragHandler
  #selectHandler: DrawingSelectHandler

  constructor(chart: IChartApi, series: ISeriesApi<SeriesType>) {
    this.#chart = chart
    this.#series = series
    this.#dragHandler = new DrawingDragHandler(this.#chart, () => this.#drawings.map((el) => el.drawing))
    this.#selectHandler = new DrawingSelectHandler(this.#chart, () => this.#drawings)
  }

  add(name: DrawingName): Promise<number> {
    const script = DRAWINGS.find((d) => d.drawing.ikey === name)
    if (!script) {
      throw new Error(`unknown drawing key: ${name}`)
    }

    const drawing = new script.drawing(this.#chart)
    drawing.attach(this.#series)

    return new Promise((resolve) => {
      const pc = new PointsCollector(this.#chart, this.#series, script.drawing.points)
      pc.subscribe((params) => {
        drawing.setAnchorsVisible(true)
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

  setSeries(series: ISeriesApi<SeriesType>) {
    this.#series = series
    this.#drawings.forEach((el) => {
      el.drawing.detach()
      el.drawing.attach(series)
    })
  }

  select(id: number) {
    console.log('select', id)
  }

  destroy() {
    this.#drawings.forEach((el) => {
      el.drawing.detach()
    })
    this.#selectHandler.destroy()
    this.#dragHandler.destroy()
  }
}

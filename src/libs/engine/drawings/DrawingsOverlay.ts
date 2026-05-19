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
  #dragging: { drawing: BaseDrawing; initialPoint: Point; anchorIndex?: number } | null = null

  constructor(chart: IChartApi, series: ISeriesApi<SeriesType>) {
    this.#chart = chart
    this.#series = series
    this.#chartElement = this.#chart.chartElement()
    this.#chartElement.addEventListener('click', this.#clickHandler)
    this.#chartElement.addEventListener('mousedown', this.#mousedownHandler, { capture: true })
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
    this.#chartElement.removeEventListener('mousedown', this.#mousedownHandler, { capture: true })
    window.removeEventListener('mousemove', this.#mousemoveHandler)
    window.removeEventListener('mouseup', this.#mouseupHandler)
  }

  #startDragging(drawing: BaseDrawing, initialPoint: Point, anchorIndex?: number) {
    drawing.startDrag()
    this.#dragging = { drawing, initialPoint, anchorIndex }
    window.addEventListener('mousemove', this.#mousemoveHandler)
    window.addEventListener('mouseup', this.#mouseupHandler)
  }

  #mousedownHandler = (e: MouseEvent) => {
    const { layerX: x, layerY: y } = e

    const point = { x, y } as Point

    for (const el of this.#drawings) {
      const isTapped = el.drawing.checkTap(point)
      const anchorIndex = el.drawing.checkAnchor(point)
      if (anchorIndex !== null) {
        e.stopPropagation()
        this.#startDragging(el.drawing, point, anchorIndex)
        return
      } else if (isTapped) {
        e.stopPropagation()
        this.#startDragging(el.drawing, point)
        return
      }
    }
  }

  #mousemoveHandler = (e: MouseEvent) => {
    if (!this.#dragging) {
      return
    }

    e.stopPropagation()

    const { layerX: x, layerY: y } = e
    const point = { x, y } as Point

    const dx = point.x - this.#dragging.initialPoint.x
    const dy = point.y - this.#dragging.initialPoint.y

    this.#dragging.drawing.drag(dx, dy, this.#dragging.anchorIndex)
  }

  #mouseupHandler = () => {
    if (this.#dragging) {
      this.#dragging.drawing.stopDrag()
      this.#dragging = null
    }

    window.removeEventListener('mousemove', this.#mousemoveHandler)
    window.removeEventListener('mouseup', this.#mouseupHandler)
  }

  #clickHandler = ({ layerX: x, layerY: y }: MouseEvent) => {
    this.#drawings.forEach((el) => {
      if (el.drawing.checkTap({ x, y } as Point)) {
        this.select(el.id)
      }
    })
  }
}

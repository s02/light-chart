import type { BaseDrawing } from '@engine/drawings/BaseDrawing'
import type { IChartApi, Point } from 'lightweight-charts'

export class DrawingDragHandler {
  #el: HTMLDivElement
  #chart: IChartApi
  #dragging: { drawing: BaseDrawing; initialPoint: Point; anchorIndex: number | null } | null = null
  #getDrawings: () => BaseDrawing[]
  #isAvailable: () => boolean

  constructor(chart: IChartApi, getDrawings: () => BaseDrawing[], isAvailable: () => boolean) {
    this.#el = chart.chartElement()
    this.#chart = chart
    this.#getDrawings = getDrawings
    this.#isAvailable = isAvailable
    this.#el.addEventListener('mousedown', this.#mousedownHandler, { capture: true })
  }

  #start(drawing: BaseDrawing, initialPoint: Point, anchorIndex: number | null) {
    drawing.startDrag()
    this.#dragging = { drawing, initialPoint, anchorIndex }
    window.addEventListener('mousemove', this.#mousemoveHandler)
    window.addEventListener('mouseup', this.#mouseupHandler)
  }

  #mousemoveHandler = (e: MouseEvent) => {
    if (!this.#dragging || !this.#isAvailable()) {
      return
    }

    e.stopPropagation()

    const rect = this.#el.getBoundingClientRect()
    const { width, height } = this.#chart.paneSize()

    const point = {
      x: Math.max(0, Math.min(width, e.clientX - rect.left)),
      y: Math.max(0, Math.min(height, e.clientY - rect.top))
    }

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

  #mousedownHandler = (e: MouseEvent) => {
    const { layerX: x, layerY: y } = e

    const point = { x, y } as Point

    for (const d of this.#getDrawings()) {
      const isTapped = d.checkTap(point)
      const anchorIndex = d.checkAnchor(point)
      if (anchorIndex !== null || isTapped) {
        e.stopPropagation()
        this.#start(d, point, anchorIndex)
        break
      }
    }
  }

  destroy() {
    this.#el.removeEventListener('mousedown', this.#mousedownHandler, { capture: true })
    window.removeEventListener('mousemove', this.#mousemoveHandler)
    window.removeEventListener('mouseup', this.#mouseupHandler)
  }
}

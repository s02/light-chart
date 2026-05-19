import type { BaseDrawing } from '@engine/drawings/BaseDrawing'
import type { IChartApi, Point } from 'lightweight-charts'

export class DrawingSelectHandler {
  #el: HTMLDivElement
  #chart: IChartApi
  #getElements: () => { id: number; drawing: BaseDrawing }[]

  constructor(chart: IChartApi, getElements: () => { id: number; drawing: BaseDrawing }[]) {
    this.#chart = chart
    this.#el = this.#chart.chartElement()
    this.#getElements = getElements
    this.#el.addEventListener('click', this.#clickHandler)
    this.#el.addEventListener('mousemove', this.#mousemoveHandler)
  }

  destroy() {
    this.#el.removeEventListener('click', this.#clickHandler)
  }

  select(id: number) {
    console.log('selected', id)
  }

  #mousemoveHandler = (e: MouseEvent) => {
    const rect = this.#el.getBoundingClientRect()
    const { width, height } = this.#chart.paneSize()

    const point = {
      x: Math.max(0, Math.min(width, e.clientX - rect.left)),
      y: Math.max(0, Math.min(height, e.clientY - rect.top))
    }

    this.#getElements().forEach((el) => {
      const hovered = el.drawing.checkTap(point as Point)
      el.drawing.setAnchorsVisible(hovered)
    })
  }

  #clickHandler = ({ layerX: x, layerY: y }: MouseEvent) => {
    this.#getElements().forEach((el) => {
      if (el.drawing.checkTap({ x, y } as Point)) {
        el.drawing.setSelected(true)
        this.select(el.id)
      } else {
        el.drawing.setSelected(false)
      }
    })
  }
}

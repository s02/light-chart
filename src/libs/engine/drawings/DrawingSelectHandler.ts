import type { DrawingElement } from '@engine/drawings/DrawingsManager'
import type { DrawingSelectFn } from '@engine/drawings/types'
import type { IChartApi, Point } from 'lightweight-charts'

type GetElementsFn = () => DrawingElement[]

export class DrawingSelectHandler {
  #el: HTMLDivElement
  #chart: IChartApi
  #getElements: GetElementsFn
  #onSelect: DrawingSelectFn

  constructor(chart: IChartApi, getElements: GetElementsFn, onSelect: DrawingSelectFn) {
    this.#chart = chart
    this.#el = this.#chart.chartElement()
    this.#getElements = getElements
    this.#onSelect = onSelect
    this.#el.addEventListener('click', this.#clickHandler)
    this.#el.addEventListener('mousemove', this.#mousemoveHandler)
  }

  destroy() {
    this.#el.removeEventListener('click', this.#clickHandler)
  }

  select(el: DrawingElement) {
    el.drawing.setSelected(true)
    this.#onSelect({ id: el.id, ds: el.drawing.getSchema() })
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
        this.select(el)
      } else {
        el.drawing.setSelected(false)
      }
    })
  }
}

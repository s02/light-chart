import { DRAWINGS, type DrawingName } from '@engine/drawings'
import { PointsCollector } from './PointsCollector'
import { ContinuousPointsCollector, CONTINUOUS_POINTS_MODE } from './ContinuousPointsCollector'
import { DrawingDragHandler } from '@engine/drawings/DrawingDragHandler'
import { DrawingSelectHandler } from '@engine/drawings/DrawingSelectHandler'
import type { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts'
import type { BaseDrawing } from './BaseDrawing'
import type { DrawingSelectFn } from './types'
import type { StudyParams } from '@engine/schema'

export type DrawingElement = {
  id: number
  drawing: BaseDrawing
}
export class DrawingsManager {
  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #drawings: DrawingElement[] = []
  #id = 10
  #dragHandler: DrawingDragHandler
  #selectHandler: DrawingSelectHandler
  #subscribers: DrawingSelectFn[] = []
  #pendingAdd?: { pc: PointsCollector; drawing: BaseDrawing; reject: (reason?: unknown) => void }

  constructor(chart: IChartApi, series: ISeriesApi<SeriesType>) {
    this.#chart = chart
    this.#series = series
    this.#dragHandler = new DrawingDragHandler(this.#chart, () => this.#drawings.map((el) => el.drawing))
    this.#selectHandler = new DrawingSelectHandler(this.#chart, () => this.#drawings, this.#onSelect)
  }

  add(name: DrawingName): Promise<number> {
    if (this.#pendingAdd) {
      this.#pendingAdd.pc.destroy()
      this.#pendingAdd.drawing.detach()
      this.#pendingAdd.reject(new Error('cancelled'))
      this.#pendingAdd = undefined
    }

    const script = DRAWINGS.find((d) => d.drawing.ikey === name)
    if (!script) {
      throw new Error(`unknown drawing key: ${name}`)
    }

    const drawing = new script.drawing(this.#chart)
    drawing.attach(this.#series)

    return new Promise((resolve, reject) => {
      const pc =
        script.drawing.points === CONTINUOUS_POINTS_MODE
          ? new ContinuousPointsCollector(this.#chart, this.#series)
          : new PointsCollector(this.#chart, this.#series, script.drawing.points)
      this.#pendingAdd = { pc, drawing, reject }
      pc.subscribe((params) => {
        drawing.setAnchorsVisible(true)
        drawing.setAnchors(params.points)
        if (params.status === 'done') {
          const id = this.#id++
          const el = { id, drawing }
          this.#drawings.push(el)
          this.#selectHandler.select(el)
          this.#pendingAdd = undefined
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

  updateParams(id: DrawingElement['id'], params: StudyParams) {
    const el = this.#findElement(id)
    el.drawing.setParams(params)
  }

  remove(id: DrawingElement['id']) {
    const el = this.#findElement(id)
    el.drawing.detach()
    this.#drawings = this.#drawings.filter((d) => d.id !== id)
  }

  subscribe(cb: DrawingSelectFn) {
    this.#subscribers.push(cb)
  }

  destroy() {
    this.#drawings.forEach((el) => {
      el.drawing.detach()
    })
    this.#selectHandler.destroy()
    this.#dragHandler.destroy()
  }

  #onSelect = (res: Parameters<DrawingSelectFn>[0]) => {
    this.#subscribers.forEach((cb) => cb(res))
  }

  #findElement(id: DrawingElement['id']) {
    const el = this.#drawings.find((d) => d.id === id)
    if (!el) {
      throw new Error(`Unknown drawing element id: ${id}`)
    }

    return el
  }
}

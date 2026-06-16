import { geometry } from '@engine/drawings/geometry'
import type { DrawingSchema, DrawingViewport } from '@engine/drawings/types'
import type { Anchor } from '@engine/points'
import type { StudyParams } from '@engine/schema'
import type {
  IChartApi,
  IPrimitivePaneView,
  ISeriesApi,
  ISeriesPrimitive,
  Point,
  SeriesAttachedParameter,
  SeriesType,
  Time
} from 'lightweight-charts'

function assertSeries(series: ISeriesApi<SeriesType> | undefined): asserts series {
  if (!series) {
    throw new Error(`Drawing: Series isn't defined`)
  }
}

export abstract class BaseDrawing implements ISeriesPrimitive<Time> {
  static readonly hitThreashold = 10

  protected anchorsVisible = false
  protected anchors: Anchor[] = []
  protected requestUpdate: (() => void) | null = null
  protected initialized = false

  #series: ISeriesApi<SeriesType> | undefined
  #chart: IChartApi
  #draggingAnchors: Anchor[] | null = null
  #selected = false

  constructor(chart: IChartApi) {
    this.#chart = chart
  }

  setSelected(val: boolean) {
    this.#selected = val
    this.setAnchorsVisible(val)
  }

  setAnchorsVisible(val: boolean) {
    if (this.#selected) {
      return
    }

    const prev = this.anchorsVisible
    this.anchorsVisible = val
    if (this.requestUpdate && this.anchorsVisible !== prev) {
      this.requestUpdate()
    }
  }

  startDrag() {
    if (this.#draggingAnchors) {
      return
    }
    this.setSelected(true)
    this.#draggingAnchors = [...this.anchors]
  }

  drag(dx: number, dy: number, anchorIndex: number | null) {
    const viewport = this.getViewport()
    if (!viewport || !this.#draggingAnchors) {
      return
    }

    const anchors: Anchor[] = []

    for (let i = 0; i < this.#draggingAnchors.length; i++) {
      if (anchorIndex !== null && anchorIndex !== i) {
        anchors.push(this.#draggingAnchors[i])
        continue
      }

      const point = viewport.anchorToPoint(this.#draggingAnchors[i])

      if (!point) {
        return
      }

      const anchor = viewport.pointToAnchor({ x: point.x + dx, y: point.y + dy } as Point)

      if (!anchor) {
        return
      }

      anchors.push(anchor)
    }

    this.setAnchors(anchors)
  }

  stopDrag() {
    this.#draggingAnchors = null
  }

  setAnchors(anchors: Anchor[]) {
    this.anchors = anchors
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  attached({ requestUpdate }: SeriesAttachedParameter<Time>) {
    this.requestUpdate = requestUpdate
    this.requestUpdate()
  }

  detach() {
    if (this.#series) {
      this.#series.detachPrimitive(this)
      this.#series = undefined
    }
  }

  attach(series: ISeriesApi<SeriesType>) {
    this.#series = series
    this.#series.attachPrimitive(this)
  }

  setInitialized() {
    this.initialized = true
  }

  protected getViewport(): DrawingViewport | null {
    if (!this.#series || !this.#chart) {
      return null
    }

    return {
      pointToAnchor: (point: Point) => {
        assertSeries(this.#series)

        const time = this.#chart.timeScale().coordinateToTime(point.x)
        const price = this.#series.coordinateToPrice(point.y)

        if (!time || !price) {
          return null
        }

        return {
          time,
          price,
          x: point.x,
          y: point.y
        }
      },
      anchorToPoint: (anchor: { time: Time; price: number }) => {
        assertSeries(this.#series)

        const x = this.#chart.timeScale().timeToCoordinate(anchor.time)
        const y = this.#series.priceToCoordinate(anchor.price)

        if (!x || !y) {
          return null
        }

        return {
          x,
          y
        }
      },
      barsBetween: (t1: Time, t2: Time) => {
        const x1 = this.#chart.timeScale().timeToCoordinate(t1)
        const x2 = this.#chart.timeScale().timeToCoordinate(t2)
        if (x1 === null || x2 === null) return null
        const l1 = this.#chart.timeScale().coordinateToLogical(x1)
        const l2 = this.#chart.timeScale().coordinateToLogical(x2)
        if (l1 === null || l2 === null) return null
        return Math.round(Math.abs((l2 as number) - (l1 as number)))
      }
    }
  }

  checkAnchor(point: Point) {
    const viewport = this.getViewport()
    if (!viewport) {
      return null
    }

    for (let i = 0; i < this.anchors.length; i++) {
      const p = viewport.anchorToPoint(this.anchors[i])
      if (p && geometry.distance(p, point) < BaseDrawing.hitThreashold) {
        return i
      }
    }

    return null
  }

  abstract paneViews(): IPrimitivePaneView[]
  abstract checkTap(point: Point): boolean
  abstract setParams(params: StudyParams): void
  abstract getSchema(): DrawingSchema
}

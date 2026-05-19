import { geometry } from '@engine/drawings/geometry'
import type { Anchor, DrawingViewport } from '@engine/drawings/types'
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

function assertChart(chart: IChartApi | undefined): asserts chart {
  if (!chart) throw `Drawing: Chart isn't defined`
}

function assertSeries(series: ISeriesApi<SeriesType> | undefined): asserts series {
  if (!series) throw `Drawing: Series isn't defined`
}

export abstract class BaseDrawing implements ISeriesPrimitive<Time> {
  static readonly hitThreashold = 5
  protected anchors: Anchor[] = []
  #requestUpdate: (() => void) | null = null
  #series: ISeriesApi<SeriesType> | undefined
  #chart: IChartApi | undefined
  #draggingAnchors: Anchor[] | null = null

  startDrag() {
    if (this.#draggingAnchors) {
      return
    }

    this.#draggingAnchors = [...this.anchors]
  }

  drag(dx: number, dy: number, anchorIndex?: number) {
    const viewport = this.getViewport()
    if (!viewport || !this.#draggingAnchors) {
      return
    }

    const anchors: Anchor[] = []

    for (let i = 0; i < this.#draggingAnchors.length; i++) {
      if (anchorIndex !== undefined && anchorIndex !== i) {
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

  getAnchors(): Anchor[] {
    return this.anchors
  }

  setAnchors(anchors: Anchor[]) {
    this.anchors = anchors
    if (this.#requestUpdate) {
      this.#requestUpdate()
    }
  }

  updateAnchor(anchor: Anchor, i: number) {
    this.anchors[i] = anchor
    if (this.#requestUpdate) {
      this.#requestUpdate()
    }
  }

  move({ x, y }: { x: number; y: number }) {
    const viewport = this.getViewport()
    if (!viewport) {
      return
    }

    this.anchors = this.anchors.map((anchor) => {
      const point = viewport.anchorToPoint(anchor)
      if (point) {
        const nextAnchor = viewport.pointToAnchor({ x: point.x + x, y: point.y + y } as Point)
        if (nextAnchor) {
          return nextAnchor
        }
      }

      return anchor
    })

    if (this.#requestUpdate) {
      this.#requestUpdate()
    }
  }

  attached({ requestUpdate }: SeriesAttachedParameter<Time>) {
    this.#requestUpdate = requestUpdate
    this.#requestUpdate()
  }

  detach() {
    if (this.#series) {
      this.#series.detachPrimitive(this)
      this.#series = undefined
    }

    if (this.#chart) {
      this.#chart = undefined
    }
  }

  attach(series: ISeriesApi<SeriesType>, chart: IChartApi) {
    this.#series = series
    this.#chart = chart
    this.#series.attachPrimitive(this)
  }

  getViewport(): DrawingViewport | null {
    if (!this.#series || !this.#chart) {
      return null
    }

    return {
      pointToAnchor: (point: Point) => {
        assertChart(this.#chart)
        assertSeries(this.#series)

        const time = this.#chart.timeScale().coordinateToTime(point.x)
        const price = this.#series.coordinateToPrice(point.y)

        if (!time || !price) {
          return null
        }

        return {
          time,
          price
        }
      },
      anchorToPoint: (anchor: Anchor) => {
        assertChart(this.#chart)
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
      }
    }
  }

  abstract paneViews(): IPrimitivePaneView[]
  abstract checkTap(point: Point): boolean

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
}

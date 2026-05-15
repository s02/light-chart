import type { Anchor, DrawingViewport } from '@engine/drawings/types'
import type {
  IChartApi,
  IPrimitivePaneView,
  ISeriesApi,
  ISeriesPrimitive,
  Logical,
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

export abstract class Drawing implements ISeriesPrimitive<Time> {
  protected anchors: Anchor[] = []
  #requestUpdate: (() => void) | null = null
  #series: ISeriesApi<SeriesType> | undefined
  #chart: IChartApi | undefined

  setAnchors(anchors: Anchor[]) {
    this.anchors = anchors
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
      },
      timeScale: {
        coordinateToTime: (x: number) => {
          assertChart(this.#chart)
          return this.#chart.timeScale().coordinateToTime(x)
        },
        timeToCoordinate: (time: Time) => {
          assertChart(this.#chart)
          return this.#chart.timeScale().timeToCoordinate(time)
        },
        logicalToCoordinate: (logical: Logical) => {
          assertChart(this.#chart)
          return this.#chart.timeScale().logicalToCoordinate(logical)
        }
      },
      priceScale: {
        coordinateToPrice: (y: number) => {
          assertSeries(this.#series)
          return this.#series.coordinateToPrice(y)
        },
        priceToCoordinate: (price: number) => {
          assertSeries(this.#series)
          return this.#series.priceToCoordinate(price)
        }
      }
    }
  }

  abstract paneViews(): IPrimitivePaneView[]
}

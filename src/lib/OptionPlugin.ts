import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type {
  IChartApi,
  ISeriesApi,
  ISeriesPrimitive,
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  SeriesAttachedParameter,
  SeriesType,
  Time,
  Coordinate
} from 'lightweight-charts'
import type { ChartOption } from './Chart'
import type { ResolutionId } from './constants'
import { getBarLogical } from './helpers'

const DOT_RADIUS_MEDIA = 5

type Points = {
  x1: Coordinate | null
  y1: Coordinate | null
  x2: Coordinate | null
  y2: Coordinate | null
}

class OptionShapeRenderer implements IPrimitivePaneRenderer {
  #points: Points
  #isProfitable: boolean

  constructor(points: Points, isProfitable: boolean) {
    this.#points = points
    this.#isProfitable = isProfitable
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const { x1, y1, x2, y2 } = this.#points
      const ctx = scope.context
      const hpr = scope.horizontalPixelRatio
      const vpr = scope.verticalPixelRatio
      const radius = DOT_RADIUS_MEDIA * hpr

      if (x1 !== null && y1 !== null && x2 !== null && y2 !== null) {
        ctx.beginPath()
        ctx.moveTo(x1 * hpr, y1 * vpr)
        ctx.lineTo(x2 * hpr, y2 * vpr)
        ctx.strokeStyle = '#888888'
        ctx.lineWidth = 1 * hpr
        ctx.stroke()
      }

      if (x1 !== null && y1 !== null) {
        ctx.beginPath()
        ctx.arc(x1 * hpr, y1 * vpr, radius, 0, Math.PI * 2)
        ctx.fillStyle = '#2962FF'
        ctx.fill()
      }

      if (x2 !== null && y2 !== null) {
        ctx.beginPath()
        ctx.arc(x2 * hpr, y2 * vpr, radius, 0, Math.PI * 2)
        ctx.fillStyle = this.#isProfitable ? '#00c21f' : '#f92c14'
        ctx.fill()
      }
    })
  }
}

class OptionShapePaneView implements IPrimitivePaneView {
  #source: OptionPlugin
  #points: Points = { x1: null, y1: null, x2: null, y2: null }

  constructor(source: OptionPlugin) {
    this.#source = source
  }

  update() {
    const timeScale = this.#source.getChart().timeScale()
    const series = this.#source.getSeries()

    if (!series) {
      return
    }

    const startBarLogical = getBarLogical(
      timeScale,
      this.#source.getLastBarTime(),
      this.#source.getOpenTime(),
      this.#source.getResolution()
    )

    const endBarLogical = getBarLogical(
      timeScale,
      this.#source.getLastBarTime(),
      this.#source.getCloseTime(),
      this.#source.getResolution()
    )

    if (!startBarLogical || !endBarLogical) {
      return
    }

    const x1 = timeScale.logicalToCoordinate(startBarLogical)
    const y1 = series.priceToCoordinate(this.#source.getPrice())
    const x2 = timeScale.logicalToCoordinate(endBarLogical)

    this.#points = { x1, y1, x2, y2: y1 }
  }

  renderer() {
    return new OptionShapeRenderer(this.#points, this.#source.isProfitable())
  }
}

export class OptionPlugin implements ISeriesPrimitive<Time> {
  #chart: IChartApi
  #option: ChartOption
  #series: ISeriesApi<SeriesType> | null = null
  #resolution: ResolutionId
  #paneViews: OptionShapePaneView[]

  constructor(chart: IChartApi, option: ChartOption, resolution: ResolutionId) {
    this.#chart = chart
    this.#resolution = resolution
    this.#option = option
    this.#paneViews = [new OptionShapePaneView(this)]
  }

  attached({ series }: SeriesAttachedParameter<Time>) {
    this.#series = series as ISeriesApi<SeriesType>
  }

  detached() {
    this.#series = null
  }

  getLastBarTime() {
    return this.#series?.data().at(-1)?.time
  }

  isProfitable() {
    const lastBarPrice = this.#getLastBarPrice()

    if (!lastBarPrice) {
      return false
    }

    return (
      (this.#option.kind === 'up' && lastBarPrice > this.#option.quoteOpen) ||
      (this.#option.kind === 'down' && lastBarPrice < this.#option.quoteOpen)
    )
  }

  getPrice() {
    return this.#option.quoteOpen
  }

  getOpenTime() {
    return this.#option.createdAt
  }

  getCloseTime() {
    return this.#option.expirationDate
  }

  getSeries() {
    return this.#series
  }

  getChart() {
    return this.#chart
  }

  getResolution() {
    return this.#resolution
  }

  updateAllViews() {
    this.#paneViews.forEach((pw) => pw.update())
  }

  paneViews() {
    return this.#paneViews
  }

  #getLastBarPrice() {
    const lastBar = this.#series?.data().at(-1)
    if (lastBar && 'close' in lastBar) {
      return lastBar.close
    }

    if (lastBar && 'value' in lastBar) {
      return lastBar.value
    }

    return null
  }
}

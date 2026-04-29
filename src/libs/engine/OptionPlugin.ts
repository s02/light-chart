import { getBarLogical, getBarPrice, getBarTime } from './helpers'
import { verticalLine } from '@engine/primitives/vertical-line'
import { circle } from '@engine/primitives/circle'
import { horizontalLine } from '@engine/primitives/horizontal-line'
import { infoMarker } from '@engine/primitives/info-marker'
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
  Coordinate,
  Point,
  UTCTimestamp
} from 'lightweight-charts'
import type { ChartOption, ResolutionId } from '@engine/types'

type OptionPoint = {
  x: Coordinate | null
  y: Coordinate | null
}

type RendererInfo = {
  option: ChartOption
  isProfitable: boolean
}

class OptionRenderer implements IPrimitivePaneRenderer {
  #openPoint: OptionPoint
  #closePoint: OptionPoint
  #isProfitable: boolean
  #option: ChartOption

  constructor(openPoint: OptionPoint, closePoint: OptionPoint, { option, isProfitable }: RendererInfo) {
    this.#openPoint = openPoint
    this.#closePoint = closePoint
    this.#isProfitable = isProfitable
    this.#option = option
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      if (this.#openPoint.x && this.#openPoint.y) {
        circle(scope, this.#openPoint.x, this.#openPoint.y, { radius: 3, color: '#999' })
      }

      if (this.#closePoint.x) {
        verticalLine(scope, this.#closePoint.x, { width: 1, color: '#00c21f' })
      }

      if (this.#closePoint.x && this.#closePoint.y) {
        const marker = this.#option.kind === 'up' ? '▴' : '▾'
        const defaultColor = this.#option.kind === 'up' ? '#00c21f' : '#f92c14'
        const background = this.#isProfitable ? defaultColor : '#999'
        infoMarker(scope, this.#closePoint as Point, { text: `${marker} 100$`, background })
      }

      if (this.#openPoint.x && this.#openPoint.y && this.#closePoint.x && this.#closePoint.y) {
        horizontalLine(scope, this.#openPoint as Point, this.#closePoint as Point, {
          width: 3,
          color: '#00c21f',
          dash: true
        })
      }
    })
  }
}

class OptionShapePaneView implements IPrimitivePaneView {
  #source: OptionPlugin
  #option: ChartOption
  #openPoint: OptionPoint = { x: null, y: null }
  #closePoint: OptionPoint = { x: null, y: null }

  constructor(source: OptionPlugin) {
    this.#source = source
    this.#option = this.#source.getOption()
  }

  update() {
    const timeScale = this.#source.getChart().timeScale()
    const series = this.#source.getSeries()

    if (!series) {
      return
    }

    const lastBarTime = this.#source.getLastBarTime()

    if (!lastBarTime) {
      return
    }

    const y = series.priceToCoordinate(this.#option.quoteOpen)
    const resolutionId = this.#source.getResolution()
    const startBarLogical = getBarLogical(timeScale, lastBarTime, this.#option.createdAt, resolutionId)

    if (startBarLogical) {
      this.#openPoint.x = timeScale.logicalToCoordinate(startBarLogical)
      this.#openPoint.y = y
    }

    const endBarLogical = getBarLogical(timeScale, lastBarTime, this.#option.expirationDate, resolutionId)

    if (endBarLogical) {
      this.#closePoint.x = timeScale.logicalToCoordinate(endBarLogical)
      this.#closePoint.y = y
    }
  }

  renderer() {
    return new OptionRenderer(this.#openPoint, this.#closePoint, {
      isProfitable: this.#source.isOptionProfitable(),
      option: this.#option
    })
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
    return getBarTime(this.#series?.data().at(-1))
  }

  getOption() {
    return this.#option
  }

  isOptionProfitable() {
    const lastBarPrice = this.#getLastBarPrice()

    if (!lastBarPrice) {
      return false
    }

    return (
      (this.#option.kind === 'up' && lastBarPrice > this.#option.quoteOpen) ||
      (this.#option.kind === 'down' && lastBarPrice < this.#option.quoteOpen)
    )
  }

  getChart() {
    return this.#chart
  }

  getSeries() {
    return this.#series
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
    return getBarPrice(lastBar)
  }
}

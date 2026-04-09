import { getBarLogical } from './helpers'
import type { ResolutionId } from './constants'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type {
  IChartApi,
  ISeriesApi,
  ISeriesPrimitive,
  IPrimitivePaneRenderer,
  SeriesAttachedParameter,
  SeriesType,
  Time,
  IPrimitivePaneView,
  Coordinate
} from 'lightweight-charts'
import type { ChartExpiration } from './Chart'

type VerticalLineOptions = {
  color: string
  width: number
}

type BitmapPositionLength = {
  position: number
  length: number
}

const centreOffset = (lineBitmapWidth: number): number => {
  return Math.floor(lineBitmapWidth * 0.5)
}

const positionsLine = (
  positionMedia: number,
  pixelRatio: number,
  desiredWidthMedia: number = 1,
  widthIsBitmap?: boolean
): BitmapPositionLength => {
  const scaledPosition = Math.round(pixelRatio * positionMedia)
  const lineBitmapWidth = widthIsBitmap ? desiredWidthMedia : Math.round(desiredWidthMedia * pixelRatio)
  const offset = centreOffset(lineBitmapWidth)
  const position = scaledPosition - offset
  return { position, length: lineBitmapWidth }
}

const ALLOWED_RESOLUTIONS: ResolutionId[] = ['5S', '10S', '15S', '30S', '1']

class VertLinePaneRenderer implements IPrimitivePaneRenderer {
  #x: Coordinate | null = null
  #options: VerticalLineOptions

  constructor(x: Coordinate | null, options: VerticalLineOptions) {
    this.#x = x
    this.#options = options
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      if (this.#x === null) return
      const ctx = scope.context
      const position = positionsLine(this.#x, scope.horizontalPixelRatio, this.#options.width)
      ctx.fillStyle = this.#options.color
      ctx.fillRect(position.position, 0, position.length, scope.bitmapSize.height)
    })
  }
}

const defaultOptions: VerticalLineOptions = {
  color: '#e25447',
  width: 1
}

class VertLinePaneView implements IPrimitivePaneView {
  #source: ExpirationPlugin
  #x: Coordinate | null = null
  #options: VerticalLineOptions

  constructor(source: ExpirationPlugin, options: VerticalLineOptions) {
    this.#source = source
    this.#options = options
  }

  update() {
    const timeScale = this.#source.getChart().timeScale()
    const pos = getBarLogical(
      this.#source.getChart().timeScale(),
      this.#source.getLastBarTime(),
      this.#source.getTime(),
      this.#source.getResolution()
    )

    if (!pos) {
      return
    }

    this.#x = timeScale.logicalToCoordinate(pos)
  }

  renderer() {
    return new VertLinePaneRenderer(this.#x, this.#options)
  }
}

export class ExpirationPlugin implements ISeriesPrimitive<Time> {
  #chart: IChartApi
  #series: ISeriesApi<SeriesType> | null = null
  #expiration: ChartExpiration
  #resolution: ResolutionId
  #paneViews: VertLinePaneView[] = []

  constructor(chart: IChartApi, expiration: ChartExpiration, resolution: ResolutionId) {
    const vertLineOptions: VerticalLineOptions = {
      ...defaultOptions
    }

    this.#chart = chart
    this.#expiration = expiration
    this.#resolution = resolution

    if (ALLOWED_RESOLUTIONS.find((res) => res === resolution)) {
      this.#paneViews = [new VertLinePaneView(this, vertLineOptions)]
    }
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

  getResolution() {
    return this.#resolution
  }

  getChart() {
    return this.#chart
  }

  getTime() {
    return this.#expiration.close
  }

  updateAllViews() {
    this.#paneViews.forEach((pw) => pw.update())
  }

  paneViews() {
    return this.#paneViews
  }
}

import { getBarLogical } from './helpers'
import { verticalLine } from '@engine/primitives/vertical-line'
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
  Coordinate,
  UTCTimestamp
} from 'lightweight-charts'
import type { ChartExpiration, ResolutionId } from '@engine/types'

const LOCK_ALLOWED_RESOLUTIONS: ResolutionId[] = ['1S', '5S', '10S', '15S', '30S']
const CLOSE_ALLOWED_RESOLUTIONS: ResolutionId[] = ['1S', '5S', '10S', '15S', '30S', '1']

type ExpirationPoint = {
  x: Coordinate | null
}

interface PaneView extends IPrimitivePaneView {
  update: () => void
}

class CloseLineRenderer implements IPrimitivePaneRenderer {
  #p: ExpirationPoint

  constructor(p: ExpirationPoint) {
    this.#p = p
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      if (this.#p.x) {
        verticalLine(scope, this.#p.x, { color: '#e25447', width: 1, label: { text: 'Expiration Time' } })
      }
    })
  }
}

class LockLineRenderer implements IPrimitivePaneRenderer {
  #p: ExpirationPoint
  #diff: string

  constructor(p: ExpirationPoint, diff: string) {
    this.#p = p
    this.#diff = diff
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      if (this.#p.x) {
        verticalLine(scope, this.#p.x, {
          color: '#0db1fd',
          width: 1,
          dash: true,
          label: { text: `Lock Time ${this.#diff}`, position: 'left' }
        })
      }
    })
  }
}

class CloseLineView implements IPrimitivePaneView, PaneView {
  protected time: UTCTimestamp
  protected source: ExpirationPlugin
  protected p: ExpirationPoint = { x: null }

  constructor(source: ExpirationPlugin, time: UTCTimestamp) {
    this.source = source
    this.time = time
  }

  update() {
    const timeScale = this.source.getChart().timeScale()
    const lastBarTime = this.source.getLastBarTime()

    if (!lastBarTime) {
      return
    }

    const posLogical = getBarLogical(timeScale, lastBarTime, this.time, this.source.getResolutionId())

    if (!posLogical) {
      return
    }

    this.p.x = timeScale.logicalToCoordinate(posLogical)
  }

  renderer(): IPrimitivePaneRenderer {
    return new CloseLineRenderer(this.p)
  }
}

class LockLineView extends CloseLineView {
  #getTimer() {
    const now = Math.floor(Date.now() / 1000)
    const diff = Math.max(0, this.time - now)
    const m = Math.floor(diff / 60)
    const s = diff % 60
    const label = diff > 0 ? `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : ''

    return {
      diff,
      label
    }
  }

  override renderer() {
    const timer = this.#getTimer()
    return new LockLineRenderer(this.p, timer.diff <= 30 ? timer.label : '')
  }
}

export class ExpirationPlugin implements ISeriesPrimitive<Time> {
  #chart: IChartApi
  #series: ISeriesApi<SeriesType> | null = null
  #expiration: ChartExpiration
  #resolutionId: ResolutionId
  #paneViews: PaneView[] = []
  #timerInterval: ReturnType<typeof setInterval> | null = null

  constructor(chart: IChartApi, expiration: ChartExpiration, resolutionId: ResolutionId) {
    this.#chart = chart
    this.#expiration = expiration
    this.#resolutionId = resolutionId

    if (LOCK_ALLOWED_RESOLUTIONS.includes(resolutionId)) {
      this.#paneViews.push(new LockLineView(this, this.#expiration.lock))
    }

    if (CLOSE_ALLOWED_RESOLUTIONS.includes(resolutionId)) {
      this.#paneViews.push(new CloseLineView(this, this.#expiration.close))
    }
  }

  attached({ series, requestUpdate }: SeriesAttachedParameter<Time>) {
    this.#series = series as ISeriesApi<SeriesType>

    this.#timerInterval = setInterval(() => {
      requestUpdate()
    }, 1000)
  }

  detached() {
    this.#series = null
    if (this.#timerInterval !== null) {
      clearInterval(this.#timerInterval)
      this.#timerInterval = null
    }
  }

  getLastBarTime() {
    return this.#series?.data().at(-1)?.time as UTCTimestamp | undefined
  }

  getExpiration() {
    return this.#expiration
  }

  getChart() {
    return this.#chart
  }

  getSeries() {
    return this.#series
  }

  getResolutionId() {
    return this.#resolutionId
  }

  updateAllViews() {
    this.#paneViews.forEach((pw) => pw.update())
  }

  paneViews() {
    return this.#paneViews
  }
}

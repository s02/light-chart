import { CloseLineView, LockLineView } from './ExpirationPluginPaneView'
import type {
  IChartApi,
  ISeriesApi,
  ISeriesPrimitive,
  SeriesAttachedParameter,
  SeriesType,
  Time,
  UTCTimestamp
} from 'lightweight-charts'
import type { ChartExpiration, ResolutionId } from '@engine/types'

const LOCK_ALLOWED_RESOLUTIONS: ResolutionId[] = ['1S', '5S', '10S', '15S', '30S']
const CLOSE_ALLOWED_RESOLUTIONS: ResolutionId[] = ['1S', '5S', '10S', '15S', '30S', '1']

export class ExpirationLinesPlugin implements ISeriesPrimitive<Time> {
  #chart: IChartApi
  #series: ISeriesApi<SeriesType> | null = null
  #expiration: ChartExpiration
  #resolutionId: ResolutionId
  #timerInterval: ReturnType<typeof setInterval> | null = null

  #lockLineView: LockLineView | null = null
  #closeLineView: CloseLineView | null = null

  constructor(chart: IChartApi, expiration: ChartExpiration, resolutionId: ResolutionId) {
    this.#chart = chart
    this.#expiration = expiration
    this.#resolutionId = resolutionId

    if (LOCK_ALLOWED_RESOLUTIONS.includes(resolutionId)) {
      this.#lockLineView = new LockLineView(this, this.#expiration.lock)
    }

    if (CLOSE_ALLOWED_RESOLUTIONS.includes(resolutionId)) {
      this.#closeLineView = new CloseLineView(this, this.#expiration.close)
    }
  }

  attached({ series, requestUpdate }: SeriesAttachedParameter<Time>) {
    this.#series = series as ISeriesApi<SeriesType>

    if (!this.#lockLineView) {
      return
    }

    this.#timerInterval = setInterval(() => {
      this.#lockLineView!.updateTimer()
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
    this.paneViews().forEach((pw) => pw.update())
  }

  paneViews() {
    const paneViews = []
    if (this.#closeLineView) {
      paneViews.push(this.#closeLineView)
    }

    if (this.#lockLineView) {
      paneViews.push(this.#lockLineView)
    }

    return paneViews
  }
}

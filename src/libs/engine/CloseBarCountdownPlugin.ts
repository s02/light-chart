import { RESOLUTION_SETTINGS } from '@engine/constants'
import type {
  ISeriesApi,
  ISeriesPrimitive,
  ISeriesPrimitiveAxisView,
  SeriesAttachedParameter,
  SeriesType,
  Time
} from 'lightweight-charts'
import type { ResolutionId } from '@engine/types'
import { getBarPrice, getBarTime } from '@engine/helpers'

const formatSeconds = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const time = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`

  return h > 0 ? `${h}:${time}` : time
}

const PRICE_LABEL_HEIGHT = 22

class CountdownAxisView implements ISeriesPrimitiveAxisView {
  #source: CloseBarCountdownPlugin
  #y = 0
  #visible = false

  constructor(source: CloseBarCountdownPlugin) {
    this.#source = source
  }

  update() {
    const series = this.#source.getSeries()
    const label = this.#source.getLabel()

    if (!series || !label.length) {
      this.#visible = false
      return
    }

    const price = getBarPrice(series.data().at(-1))

    if (!price) {
      this.#visible = false
      return
    }

    const y = series.priceToCoordinate(price)

    if (!y) {
      this.#visible = false
      return
    }

    this.#y = y
    this.#visible = true
  }

  coordinate() {
    return this.#y + PRICE_LABEL_HEIGHT
  }

  text() {
    return this.#source.getLabel()
  }

  textColor() {
    return '#ffffffb3'
  }

  backColor() {
    return '#2962ff'
  }

  visible() {
    return this.#visible
  }

  tickVisible() {
    return false
  }
}

export class CloseBarCountdownPlugin implements ISeriesPrimitive<Time> {
  #series: ISeriesApi<SeriesType> | null = null
  #resolutionId: ResolutionId
  #timerInterval: ReturnType<typeof setInterval> | null = null
  #label = ''
  #axisView: CountdownAxisView

  constructor(resolutionId: ResolutionId) {
    this.#resolutionId = resolutionId
    this.#axisView = new CountdownAxisView(this)
  }

  attached({ series, requestUpdate }: SeriesAttachedParameter<Time>) {
    this.#series = series as ISeriesApi<SeriesType>
    this.#timerInterval = setInterval(() => {
      this.#updateTimer()
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

  getSeries() {
    return this.#series
  }

  getLabel() {
    return this.#label
  }

  updateAllViews() {
    this.#axisView.update()
  }

  priceAxisViews() {
    return [this.#axisView]
  }

  #updateTimer() {
    if (!this.#series) {
      return
    }

    const lastBarTime = getBarTime(this.#series.data().at(-1))

    if (!lastBarTime) {
      return
    }

    const nextBarTime = lastBarTime + RESOLUTION_SETTINGS[this.#resolutionId].seconds
    const now = Math.floor(Date.now() / 1000)
    const diff = Math.max(0, nextBarTime - now)
    this.#label = formatSeconds(diff)
  }
}

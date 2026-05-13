import { CANDLE_COLORS, RESOLUTION_SETTINGS } from '@engine/constants'
import type {
  BarData,
  ISeriesApi,
  ISeriesPrimitive,
  ISeriesPrimitiveAxisView,
  SeriesAttachedParameter,
  SeriesType,
  Time
} from 'lightweight-charts'
import type { ResolutionId } from '@engine/types'
import { getBarColor, getBarPrice, getBarTime } from '@engine/helpers'

const formatSeconds = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const time = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`

  return h > 0 ? `${h}:${time}` : time
}

const PRICE_LABEL_HEIGHT = 16

class CountdownAxisView implements ISeriesPrimitiveAxisView {
  #source: CloseBarCountdownPlugin
  #y = 0
  #visible = false
  #color: string = CANDLE_COLORS.up

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

    const lastBar = series.data().at(-1)
    const price = getBarPrice(lastBar)

    if (!price) {
      this.#visible = false
      return
    }

    const y = series.priceToCoordinate(price)

    if (!y) {
      this.#visible = false
      return
    }

    const opts = series.options()

    if ('color' in opts) {
      this.#color = opts.color
    } else if (lastBar && 'open' in lastBar && 'close' in lastBar) {
      if ('color' in lastBar && lastBar.color) {
        this.#color = lastBar.color === 'transparent' ? 'black' : lastBar.color
      } else if ('upColor' in opts && 'downColor' in opts) {
        const color = getBarColor(lastBar as BarData<Time>)
        this.#color = color === CANDLE_COLORS.up ? opts.upColor : opts.downColor
      }
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
    return '#ffffffcc'
  }

  backColor() {
    return this.#color
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
  #timerInterval: number | null = null
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

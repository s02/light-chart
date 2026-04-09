import { RESOLUTION_SETTINGS } from '@chart/constants'
import { candleHelpers } from './candleHelpers'
import type { Quote } from './transport/types'
import type { ChartBar, ResolutionId } from '@chart/types'

type CANDLE_MERGE_STRATEGY = 'continuous' | 'gap'

export class CandleStoreService {
  #data: ChartBar[] = []
  #resolutionId: ResolutionId
  #mergeStrategy: CANDLE_MERGE_STRATEGY = 'continuous'

  constructor(resolutionId: ResolutionId) {
    this.#resolutionId = resolutionId
  }

  getData() {
    return this.#data
  }

  updateWithQuote(quote: Quote) {
    if (!this.#data.length) {
      throw 'Nothing to update'
    }

    if (this.#mergeStrategy === 'continuous') {
      return this.#updateContinuously(quote)
    }

    return this.#updateWithGaps(quote)
  }

  #updateContinuously(quote: Quote) {
    const result: ChartBar[] = []

    const seconds = RESOLUTION_SETTINGS[this.#resolutionId].seconds
    const ts = Math.floor(quote.timestamp / seconds) * seconds

    const lastCandle = this.#data[this.#data.length - 1]

    candleHelpers.updateWithQuote(lastCandle, quote)
    result.push(lastCandle)

    if (ts !== lastCandle.time) {
      const candle = candleHelpers.createFromQuote(quote)
      this.#data.push(candle)
      result.push(candle)
    }

    return result
  }

  #updateWithGaps(quote: Quote) {
    const result: ChartBar[] = []

    const seconds = RESOLUTION_SETTINGS[this.#resolutionId].seconds
    const lastCandle = this.#data[this.#data.length - 1]

    if (quote.timestamp % seconds === 0) {
      const candle = candleHelpers.createFromQuote(quote)
      this.#data.push(candle)
      result.push(candle)
    } else {
      candleHelpers.updateWithQuote(lastCandle, quote)
      result.push(lastCandle)
    }

    return result
  }

  addHistory(candles: ChartBar[]) {
    if (this.#mergeStrategy === 'continuous') {
      candleHelpers.smoothify(candles)
    }

    if (candles.length && this.#data.length) {
      while (candles[candles.length - 1].time === this.#data[0].time) {
        candles.pop()
      }

      this.#data[0].open = candles[candles.length - 1].close
    }

    this.#data = [...candles, ...this.#data]
  }
}

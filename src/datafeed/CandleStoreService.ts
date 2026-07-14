import { RESOLUTION_SETTINGS } from '@chart/constants'
import { candleHelpers } from './candleHelpers'
import type { ChartBar, ResolutionId } from '@chart/types'
import type { Bar, Quote } from '@datafeed/types'
import { helpers } from '@chart/helpers'

type CANDLE_MERGE_STRATEGY = 'continuous' | 'gap'

export class CandleStoreService {
  #timeZone: string
  #data: ChartBar[] = []
  #resolutionId: ResolutionId
  #mergeStrategyName: CANDLE_MERGE_STRATEGY = 'continuous'

  constructor(resolutionId: ResolutionId, timeZone: string) {
    this.#resolutionId = resolutionId
    this.#timeZone = timeZone
  }

  getData() {
    return this.#data
  }

  #mergeStrategy(): CANDLE_MERGE_STRATEGY {
    if (this.#resolutionId === '1S') {
      return 'gap'
    }

    return this.#mergeStrategyName
  }

  updateWithQuote(quote: Quote) {
    if (!this.#data.length) {
      throw 'Nothing to update'
    }

    const zonedQuote = {
      ...quote,
      timestamp: helpers.toZonedDate(quote.timestamp, this.#timeZone)
    }

    if (this.#mergeStrategy() === 'continuous') {
      return this.#updateContinuously(zonedQuote)
    }

    return this.#updateWithGaps(zonedQuote)
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

  addHistory(candles: Bar[]) {
    const zonedCandles = candles.map((candle) => ({
      ...candle,
      time: helpers.toZonedDate(candle.time, this.#timeZone)
    }))

    if (this.#mergeStrategyName === 'continuous') {
      candleHelpers.smoothify(zonedCandles)
    }

    if (zonedCandles.length && this.#data.length) {
      while (zonedCandles[zonedCandles.length - 1].time === this.#data[0].time) {
        candles.pop()
      }

      this.#data[0].open = candles[candles.length - 1].close
    }

    this.#data = [...zonedCandles, ...this.#data]
  }
}

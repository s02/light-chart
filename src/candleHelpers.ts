import { dateToEpoch } from '@chart/helpers'
import type { Bar, Quote } from './transport/types'
import type { ChartBar, UTCTimestamp } from '@chart/types'

const transform = (candle: Bar): ChartBar => ({
  ...candle,
  date: candle.time,
  time: dateToEpoch(candle.time),
  value: candle.close
})

const smoothify = (candles: ChartBar[]): void => {
  if (!candles.length) {
    return
  }

  let i = candles.length - 1
  while (i !== 0) {
    if (!candles[i].open) {
      candles[i].open = candles[i].close
    }

    if (!candles[i].high) {
      candles[i].high = candles[i].open
    }

    if (!candles[i].low) {
      candles[i].low = candles[i].open
    }

    candles[i - 1].close = candles[i].open
    i--
  }
}

const createFromQuote = (quote: Quote): ChartBar => {
  return {
    open: quote.value,
    close: quote.value,
    time: quote.timestamp as UTCTimestamp,
    date: new Date(quote.timestamp * 1000).toISOString(),
    low: quote.value,
    high: quote.value,
    value: quote.value
  }
}

const updateWithQuote = (candle: ChartBar, quote: Quote) => {
  candle.low = Math.min(candle.low, quote.value)
  candle.high = Math.max(candle.high, quote.value)
  candle.close = quote.value
  candle.value = candle.close
}

export const candleHelpers = {
  transform,
  smoothify,
  createFromQuote,
  updateWithQuote
}

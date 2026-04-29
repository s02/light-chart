import { dateToEpoch } from '@chart/helpers'
import type { Bar, Quote } from './transport/types'
import type { ChartBar, UTCTimestamp } from '@chart/types'

const transform = (candle: Bar): ChartBar => ({
  ...candle,
  date: candle.time,
  time: dateToEpoch(candle.time),
  value: candle.close
})

const smoothify = (bar: ChartBar[]): void => {
  if (!bar.length) {
    return
  }

  const fill = (bar: ChartBar) => {
    if (!bar.open) {
      bar.open = bar.close
    }

    if (!bar.high) {
      bar.high = bar.open
    }

    if (!bar.low) {
      bar.low = bar.open
    }
  }

  let i = bar.length - 1
  while (i !== 0) {
    fill(bar[i])
    bar[i - 1].close = bar[i].open
    i--
  }

  fill(bar[i])
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

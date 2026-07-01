import { helpers } from '@chart/helpers'
import type { Bar, Quote } from './transport/types'
import type { ChartBar, UTCTimestamp } from '@chart/types'

const transform = (candle: Bar): ChartBar => ({
  ...candle,
  time: helpers.dateToEpoch(candle.time)
})

const smoothify = (bar: ChartBar[]): void => {
  if (!bar.length) {
    return
  }

  const smooth = (bar: ChartBar, prevBar: ChartBar) => {
    prevBar.close = bar.open
    prevBar.high = Math.max(prevBar.high, prevBar.close)
    prevBar.low = Math.min(prevBar.low, prevBar.close)
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
    smooth(bar[i], bar[i - 1])

    i--
  }

  fill(bar[i])
}

const createFromQuote = (quote: Quote): ChartBar => {
  return {
    open: quote.value,
    close: quote.value,
    time: quote.timestamp as UTCTimestamp,
    low: quote.value,
    high: quote.value
  }
}

const updateWithQuote = (candle: ChartBar, quote: Quote) => {
  candle.low = Math.min(candle.low, quote.value)
  candle.high = Math.max(candle.high, quote.value)
  candle.close = quote.value
}

export const candleHelpers = {
  transform,
  smoothify,
  createFromQuote,
  updateWithQuote
}

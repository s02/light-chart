import { BollingerBands } from '@engine/indicators/BollingerBands'
import { SimpleMovingAverage } from '@engine/indicators/SimpleMovingAverage'

export const INDICATOR_SCRIPTS = [
  {
    key: 'bollinger-bands',
    indicator: BollingerBands
  },
  {
    key: 'sma',
    indicator: SimpleMovingAverage
  }
  /* {
    key: 'supertrend'
  },
  {
    key: 'parabolic-sar'
  },
  {
    key: 'rsi'
  },
  {
    key: 'macd'
  },
  {
    key: 'stochastic'
  },
  {
    key: 'stochastic-rsi'
  } */
] as const

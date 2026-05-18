import { BollingerBands } from '@engine/indicators/BollingerBands/BollingerBands'
import { SimpleMovingAverage } from '@engine/indicators/SimpleMovingAverage/SimpleMovingAverage'
import type { IndicatorScript } from '@engine/indicators/types'

export const INDICATOR_SCRIPTS: IndicatorScript[] = [
  {
    indicator: BollingerBands
  },
  {
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

import { BollingerBands } from './BollingerBands/BollingerBands'
import { SimpleMovingAverage } from './SimpleMovingAverage/SimpleMovingAverage'
import type { IndicatorScript } from './types'

export const INDICATOR_SCRIPTS: IndicatorScript[] = [
  {
    indicator: BollingerBands
  },
  {
    indicator: SimpleMovingAverage,
    separatePane: true
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

export { IndicatorsOverlay } from './IndicatorsOverlay'
export type { IndicatorName, IndicatorParams, IndicatorScript } from './types'
export type { IndicatorSchema } from './schema'

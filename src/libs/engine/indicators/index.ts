import { BollingerBands } from './BollingerBands/BollingerBands'
import { SimpleMovingAverage } from './SimpleMovingAverage/SimpleMovingAverage'
import { MACD } from './MACD/MACD'
import { Supertrend } from './Supertrend/Supertrend'
import { ParabolicSAR } from './ParabolicSAR/ParabolicSAR'
import { Stochastic } from './Stochastic/Stochastic'
import type { IndicatorScript } from './types'

export const INDICATOR_SCRIPTS: IndicatorScript[] = [
  {
    indicator: BollingerBands
  },
  {
    indicator: SimpleMovingAverage
  },
  {
    indicator: MACD,
    separatePane: true
  },
  {
    indicator: Supertrend
  },
  {
    indicator: ParabolicSAR
  },
  {
    indicator: Stochastic,
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
    key: 'stochastic'
  },
  {
    key: 'stochastic-rsi'
  } */
] as const

export { IndicatorsManager } from './IndicatorsManager'
export type { IndicatorName, IndicatorScript } from './types'

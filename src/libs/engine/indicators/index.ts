import { BollingerBands } from './BollingerBands/BollingerBands'
import { SimpleMovingAverage } from './SimpleMovingAverage/SimpleMovingAverage'
import { MACD } from './MACD/MACD'
import { Supertrend } from './Supertrend/Supertrend'
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

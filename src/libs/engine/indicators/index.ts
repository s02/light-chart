import { BollingerBands } from '@engine/indicators/BollingerBands'
import { SimpleMovingAverage } from '@engine/indicators/SimpleMovingAverage'
import type { Datafeed, Indicator } from '@engine/types'
import type { IChartApi } from 'lightweight-charts'

type IndicatorScript = {
  key: string
  indicator: new (chart: IChartApi, datafeed: Datafeed, paneIndex?: number) => Indicator
  separatePane?: boolean
}

export const INDICATOR_SCRIPTS: IndicatorScript[] = [
  {
    key: 'bollinger-bands',
    indicator: BollingerBands
  },
  {
    key: 'sma',
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

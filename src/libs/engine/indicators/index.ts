import { BollingerBands } from '@engine/indicators/BollingerBands'
import { SimpleMovingAverage } from '@engine/indicators/SimpleMovingAverage'
import type { Datafeed, Indicator, IndicatorParamDescriptor, InferIndicatorValues } from '@engine/types'
import type { IChartApi } from 'lightweight-charts'

interface IndicatorConstructor {
  new (chart: IChartApi, datafeed: Datafeed, paneIndex?: number): Indicator
  readonly ikey: string
}

type IndicatorScript = {
  indicator: IndicatorConstructor
  separatePane?: boolean
}

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

export function indicatorDefaultValues<T extends readonly IndicatorParamDescriptor[]>(
  descriptors: T
): InferIndicatorValues<T> {
  return Object.fromEntries(descriptors.map((d) => [d.key, d.default])) as InferIndicatorValues<T>
}

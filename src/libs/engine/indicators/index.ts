import { BollingerBands } from '@engine/indicators/BollingerBands/BollingerBands'
import { SimpleMovingAverage } from '@engine/indicators/SimpleMovingAverage/SimpleMovingAverage'
import type {
  Datafeed,
  Indicator,
  IndicatorParamDescriptor,
  IndicatorParams,
  InferIndicatorValues
} from '@engine/types'
import type { IChartApi } from 'lightweight-charts'

export type IndicatorOptions = {
  params?: IndicatorParams
  paneIndex?: number
}
interface IndicatorConstructor {
  new (chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions): Indicator
  readonly ikey: string
}

export type IndicatorScript = {
  indicator: IndicatorConstructor
  separatePane?: boolean
}

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

export function indicatorDefaultValues<T extends readonly IndicatorParamDescriptor[]>(
  descriptors: T
): InferIndicatorValues<T> {
  return Object.fromEntries(descriptors.map((d) => [d.key, d.default])) as InferIndicatorValues<T>
}

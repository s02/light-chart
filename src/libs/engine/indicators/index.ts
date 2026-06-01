import { BollingerBands } from './BollingerBands/BollingerBands'
import { SimpleMovingAverage } from './SimpleMovingAverage/SimpleMovingAverage'
import { MACD } from './MACD/MACD'
import { Supertrend } from './Supertrend/Supertrend'
import { ParabolicSAR } from './ParabolicSAR/ParabolicSAR'
import { Stochastic } from './Stochastic/Stochastic'
import { RSI } from './RSI/RSI'
import { StochasticRSI } from './StochasticRSI/StochasticRSI'
import { WilliamsAlligator } from './WilliamsAlligator/WilliamsAlligator'
import { EMACross } from './EMACross/EMACross'
import type { IChartApi, ISeriesApi, SeriesType, Time } from 'lightweight-charts'
import type { Datafeed } from '@engine/types'
import type { StudyParams, StudySchema } from '@engine/schema'
import type { SeriesLegend, SeriesOverlayData } from '@engine/series'

type SeriesMap = Map<ISeriesApi<SeriesType, Time>, SeriesOverlayData>

type Indicator = {
  apply: () => Promise<void>
  remove: () => Promise<void> | void
  setParams: (params: StudyParams) => void
  setDatafeed: (datafeed: Datafeed) => void
  getLegend: (seriesData: SeriesMap) => SeriesLegend | undefined
  getSchema: () => {
    ikey: string
    schema: StudySchema
    params: StudyParams
  }
}

type IndicatorOptions = {
  params?: StudyParams
  paneIndex?: number
}

export const INDICATOR_SCRIPTS = [
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
  },
  {
    indicator: RSI,
    separatePane: true
  },
  {
    indicator: StochasticRSI,
    separatePane: true
  },
  {
    indicator: WilliamsAlligator
  },
  {
    indicator: EMACross
  }
] satisfies {
  indicator: {
    new (chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions): Indicator
    readonly ikey: string
  }
  separatePane?: boolean
}[]

export { IndicatorsManager } from './IndicatorsManager'
export type IndicatorName = (typeof INDICATOR_SCRIPTS)[number]['indicator']['ikey']
export type IndicatorScript = (typeof INDICATOR_SCRIPTS)[number]

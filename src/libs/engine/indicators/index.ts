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
import { PriceChannel } from './PriceChannel/PriceChannel'
import { DonchianChannels } from './DonchianChannels/DonchianChannels'
import { ExponentialMovingAverage } from './ExponentialMovingAverage/ExponentialMovingAverage'
import { ZigZag } from './ZigZag/ZigZag'
import { WilliamsFractal } from './WilliamsFractal/WilliamsFractal'
import { ConnorsRSI } from './ConnorsRSI/ConnorsRSI'
import { AwesomeOscillator } from './AwesomeOscillator/AwesomeOscillator'
import { KnowSureThing } from './KnowSureThing/KnowSureThing'
import { WilliamsR } from './WilliamsR/WilliamsR'
import { KeltnerChannels } from './KeltnerChannels/KeltnerChannels'
import { LeastSquaresMA } from './LeastSquaresMA/LeastSquaresMA'
import { ChandeKrollStop } from './ChandeKrollStop/ChandeKrollStop'
import { WeightedMovingAverage } from './WeightedMovingAverage/WeightedMovingAverage'
import { SmoothedMovingAverage } from './SmoothedMovingAverage/SmoothedMovingAverage'
import { McGinleyDynamic } from './McGinleyDynamic/McGinleyDynamic'
import { IchimokuCloud } from './IchimokuCloud/IchimokuCloud'
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
  },
  {
    indicator: PriceChannel
  },
  {
    indicator: DonchianChannels
  },
  {
    indicator: ExponentialMovingAverage
  },
  {
    indicator: ZigZag
  },
  {
    indicator: WilliamsFractal
  },
  {
    indicator: ConnorsRSI,
    separatePane: true
  },
  {
    indicator: AwesomeOscillator,
    separatePane: true
  },
  {
    indicator: KnowSureThing,
    separatePane: true
  },
  {
    indicator: WilliamsR,
    separatePane: true
  },
  {
    indicator: KeltnerChannels
  },
  {
    indicator: LeastSquaresMA
  },
  {
    indicator: ChandeKrollStop
  },
  {
    indicator: WeightedMovingAverage
  },
  {
    indicator: SmoothedMovingAverage
  },
  {
    indicator: McGinleyDynamic
  },
  {
    indicator: IchimokuCloud
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

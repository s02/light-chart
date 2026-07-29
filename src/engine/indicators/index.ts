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
import { AcceleratorOscillator } from './AcceleratorOscillator/AcceleratorOscillator'
import { CCI } from './CCI/CCI'
import { TrueStrengthIndex } from './TrueStrengthIndex/TrueStrengthIndex'
import { ATR } from './ATR/ATR'
import { VortexIndicator } from './VortexIndicator/VortexIndicator'
import { SMIErgodic } from './SMIErgodic/SMIErgodic'
import { BalanceOfPower } from './BalanceOfPower/BalanceOfPower'
import { Momentum } from './Momentum/Momentum'
import { BollingerBandsB } from './BollingerBandsB/BollingerBandsB'
import { DPO } from './DPO/DPO'
import { RelativeVigorIndex } from './RelativeVigorIndex/RelativeVigorIndex'
import { TrendStrengthIndex } from './TrendStrengthIndex/TrendStrengthIndex'
import { ADX } from './ADX/ADX'
import { DMI } from './DMI/DMI'
import { FisherTransform } from './FisherTransform/FisherTransform'
import { AdvanceDecline } from './AdvanceDecline/AdvanceDecline'
import { MACross } from './MACross/MACross'
import { ArnaudLegouxMA } from './ArnaudLegouxMA/ArnaudLegouxMA'
import { VolatilityZeroTrend } from './VolatilityZeroTrend/VolatilityZeroTrend'
import { StandardError } from './StandardError/StandardError'
import { MovingAverageDouble } from './MovingAverageDouble/MovingAverageDouble'
import { MAEMACross } from './MAEMACross/MAEMACross'
import type { IChartApi, ISeriesApi, SeriesType, Time } from 'lightweight-charts'
import type { Datafeed } from '@engine/types'
import type { StudyParams, StudySchema } from '@engine/schema'
import type { SeriesLegend, SeriesOverlayData } from '@engine/series'
import type { IndicatorOptions } from '@engine/indicators/types'

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

const INDICATOR_SCRIPTS = [
  {
    indicator: BollingerBands,
    keywords: 'bollinger bands'
  },
  {
    indicator: SimpleMovingAverage,
    keywords: 'sma simple moving average'
  },
  {
    indicator: MACD,
    separatePane: true,
    keywords: 'macd moving average convergence divergence'
  },
  {
    indicator: Supertrend,
    keywords: 'supertrend'
  },
  {
    indicator: ParabolicSAR,
    keywords: 'sar parabolic stop reverse'
  },
  {
    indicator: Stochastic,
    separatePane: true,
    keywords: 'stochastic oscillator'
  },
  {
    indicator: RSI,
    separatePane: true,
    keywords: 'rsi relative strength index'
  },
  {
    indicator: StochasticRSI,
    separatePane: true,
    keywords: 'stochastic rsi relative strength index'
  },
  {
    indicator: WilliamsAlligator,
    keywords: 'willliams alligator'
  },
  {
    indicator: EMACross,
    keywords: 'ema exponential moving average cross'
  },
  {
    indicator: PriceChannel,
    keywords: 'price channel'
  },
  {
    indicator: DonchianChannels,
    keywords: 'donchian channels'
  },
  {
    indicator: ExponentialMovingAverage,
    keywords: 'ema exponential moving average'
  },
  {
    indicator: ZigZag,
    keywords: 'zig zag'
  },
  {
    indicator: WilliamsFractal,
    keywords: 'williams fractal'
  },
  {
    indicator: ConnorsRSI,
    separatePane: true,
    keywords: 'rsi connors relative strength index'
  },
  {
    indicator: AwesomeOscillator,
    separatePane: true,
    keywords: 'awesome oscillator'
  },
  {
    indicator: KnowSureThing,
    separatePane: true,
    keywords: 'kst know sure things'
  },
  {
    indicator: WilliamsR,
    separatePane: true,
    keywords: 'williams'
  },
  {
    indicator: KeltnerChannels,
    keywords: 'keltner channels'
  },
  {
    indicator: LeastSquaresMA,
    keywords: 'ma least squares moving average'
  },
  {
    indicator: ChandeKrollStop,
    keywords: 'chande kroll stop'
  },
  {
    indicator: WeightedMovingAverage,
    keywords: 'wma weighted moving average'
  },
  {
    indicator: SmoothedMovingAverage,
    keywords: 'ssma smoothed moving average'
  },
  {
    indicator: McGinleyDynamic,
    keywords: 'mcginley dynamic'
  },
  {
    indicator: IchimokuCloud,
    keywords: 'ichimoku cloud'
  },
  {
    indicator: AcceleratorOscillator,
    separatePane: true,
    keywords: 'accelerator oscillator'
  },
  {
    indicator: CCI,
    separatePane: true,
    keywords: 'cci commodity channel index'
  },
  {
    indicator: TrueStrengthIndex,
    separatePane: true,
    keywords: 'tsi true strength index'
  },
  {
    indicator: ATR,
    separatePane: true,
    keywords: 'atr average true range'
  },
  {
    indicator: VortexIndicator,
    separatePane: true,
    keywords: 'vortex indicator'
  },
  {
    indicator: SMIErgodic,
    separatePane: true,
    keywords: 'smi stochastic momentum index ergodic'
  },
  {
    indicator: BalanceOfPower,
    separatePane: true,
    keywords: 'balance of power'
  },
  {
    indicator: Momentum,
    separatePane: true,
    keywords: 'momentum'
  },
  {
    indicator: BollingerBandsB,
    separatePane: true,
    keywords: 'bollinger bands'
  },
  {
    indicator: DPO,
    separatePane: true,
    keywords: 'dpo detrended price oscillator'
  },
  {
    indicator: RelativeVigorIndex,
    separatePane: true,
    keywords: 'relative vigor index'
  },
  {
    indicator: TrendStrengthIndex,
    separatePane: true,
    keywords: 'trend strength index'
  },
  {
    indicator: ADX,
    separatePane: true,
    keywords: 'adx average directional index'
  },
  {
    indicator: DMI,
    separatePane: true,
    keywords: 'dmi directional movement index'
  },
  {
    indicator: FisherTransform,
    separatePane: true,
    keywords: 'fisher transform'
  },
  {
    indicator: AdvanceDecline,
    separatePane: true,
    keywords: 'advance decline'
  },
  {
    indicator: MACross,
    keywords: 'ma moving average cross'
  },
  {
    indicator: ArnaudLegouxMA,
    keywords: 'arnaud legoux moving average'
  },
  {
    indicator: VolatilityZeroTrend,
    separatePane: true,
    keywords: 'volatility zero trend'
  },
  {
    indicator: StandardError,
    separatePane: true,
    keywords: 'standard error'
  },
  {
    indicator: MovingAverageDouble,
    keywords: 'moving average double'
  },
  {
    indicator: MAEMACross,
    keywords: 'maema exponential moving average cross'
  }
] satisfies {
  indicator: {
    new (chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions): Indicator
    readonly ikey: string
  }
  separatePane?: boolean
  keywords: string
}[]

export { INDICATOR_SCRIPTS }
export { IndicatorsManager } from './IndicatorsManager'
export type IndicatorName = (typeof INDICATOR_SCRIPTS)[number]['indicator']['ikey']
export type IndicatorScript = (typeof INDICATOR_SCRIPTS)[number]

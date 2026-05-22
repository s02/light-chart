import type { StudyParams, StudySchema } from '@engine/schema'
import type { SeriesLegend, SeriesOverlayData } from '@engine/series'
import type { Datafeed } from '@engine/types'
import type { IChartApi, ISeriesApi, SeriesType, Time } from 'lightweight-charts'

export type IndicatorName = 'bb' | 'sma' | 'macd' | 'supertrend' | 'sar' | 'stochastic'

interface IndicatorConstructor {
  new (chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions): Indicator
  readonly ikey: IndicatorName
}

export type SeriesMap = Map<ISeriesApi<SeriesType, Time>, SeriesOverlayData>

export type IndicatorOptions = {
  params?: StudyParams
  paneIndex?: number
}

export type IndicatorScript = {
  indicator: IndicatorConstructor
  separatePane?: boolean
}

export type Indicator = {
  apply: () => Promise<void>
  remove: () => Promise<void> | void
  setParams: (params: StudyParams) => void
  setDatafeed: (datafeed: Datafeed) => void
  getLegend: (seriesData: SeriesMap) => SeriesLegend | undefined
  getSchema: () => {
    ikey: IndicatorName
    schema: StudySchema
    params: StudyParams
  }
}

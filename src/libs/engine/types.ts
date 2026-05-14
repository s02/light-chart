import { RESOLUTION_SETTINGS } from '@engine/constants'
import type { INDICATOR_SCRIPTS } from '@engine/indicators'
import type {
  BarData,
  CustomData,
  HistogramData,
  ISeriesApi,
  LineData,
  SeriesType,
  Time,
  UTCTimestamp
} from 'lightweight-charts'

export type { UTCTimestamp } from 'lightweight-charts'

export type ChartExpiration = {
  close: UTCTimestamp
  lock: UTCTimestamp
}

export type ChartOption = {
  id: number
  quoteOpen: number
  createdAt: UTCTimestamp
  expirationDate: UTCTimestamp
  kind: 'up' | 'down'
}

export type AssetSymbol = {
  id: string
  name: string
}

export type ChartBar = {
  time: UTCTimestamp
  open: number
  high: number
  low: number
  close: number
}

export type DatafeedResult = { type: 'set' | 'update'; data: ChartBar[] }

export type DatafeedCallbackFn = (result: DatafeedResult) => void

export type Datafeed = {
  getAssetSymbol(): AssetSymbol
  getResolutionId(): ResolutionId
  getBars(): ChartBar[]
  loadHistory({ minCandles }: { minCandles: number }): Promise<void>
  unsubscribe: (id: number) => void
  subscribe: (callback: DatafeedCallbackFn) => Promise<number>
  destroy: () => void
}

export type ResolutionId = keyof typeof RESOLUTION_SETTINGS

export type SeriesLegend = {
  key: string
  paneIndex: number
  data: {
    value: string
    color: string
    label?: string
  }[]
}

export type ChartSeriesLegend = {
  category: 'main' | 'indicators'
  id: number
} & SeriesLegend

export type Indicator = {
  apply: () => Promise<void>
  remove: () => Promise<void> | void
  getLegend: (seriesData: SeriesMap) => SeriesLegend | undefined
}

export type IndicatorScript = (typeof INDICATOR_SCRIPTS)[number]['key']

export type IndicatorOnPane = { id: number; paneIndex: number; el: HTMLElement }

export type SeriesOverlayData = BarData<Time> | LineData<Time> | HistogramData<Time> | CustomData<Time>

export type SeriesMap = Map<ISeriesApi<SeriesType, Time>, SeriesOverlayData>

export interface SeriesOverlay<TData extends SeriesOverlayData = SeriesOverlayData> {
  destroy(): void
  getSeries(): ISeriesApi<SeriesType>
  getLegend(data: TData): Omit<ChartSeriesLegend, 'category' | 'id'>
  moveToTop(): void
}

export type SeriesId = 'candlestick' | 'area' | 'bar' | 'line' | 'heikin' | 'hollow'

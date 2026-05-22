import { RESOLUTION_SETTINGS } from '@engine/constants'
import type { SeriesLegend } from '@engine/series'
import type { UTCTimestamp } from 'lightweight-charts'
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
export type DatafeedDataCallbackFn = (data: ChartBar[]) => void

export type DatafeedCallbackFn = (result: DatafeedResult) => void

export type Datafeed = {
  getAssetSymbol(): AssetSymbol
  getResolutionId(): ResolutionId
  getBars(): ChartBar[]
  loadHistory({ minCandles }: { minCandles: number }): Promise<void>
  unsubscribe: (id: string) => void
  subscribe: (callback: DatafeedCallbackFn, prefix?: string) => Promise<string>
  subscribeForData: (callback: DatafeedDataCallbackFn) => Promise<string>
  destroy: () => void
}

export type ResolutionId = keyof typeof RESOLUTION_SETTINGS

export type IndicatorOnPane = { id: number; paneIndex?: number; el?: HTMLElement }

export type ChartSeriesLegend = {
  category: 'main' | 'indicators'
  id: number
} & SeriesLegend

export type { IndicatorName, IndicatorScript } from '@engine/indicators'
export type { DrawingName } from '@engine/drawings'
export type { SeriesId } from '@engine/series'

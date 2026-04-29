import { RESOLUTION_SETTINGS, SERIES_MAP } from '@engine/constants'
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
  value: number
  date: string
}

export type DatafeedCallbackFn = (result: { type: 'set' | 'update'; data: ChartBar[] }) => void

export type Datafeed = {
  getAssetSymbol(): AssetSymbol
  getResolutionId(): ResolutionId
  getBars(): ChartBar[]
  loadHistory({ minCandles }: { minCandles: number }): Promise<void>
  unsubscribe: (id: number) => void
  subscribe: (callback: DatafeedCallbackFn) => Promise<number>
}

export type ResolutionId = keyof typeof RESOLUTION_SETTINGS
export type SeriesId = keyof typeof SERIES_MAP

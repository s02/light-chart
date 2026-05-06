import { RESOLUTION_SETTINGS } from '@engine/constants'
import type { UTCTimestamp } from 'lightweight-charts'
export type { SeriesId } from '@engine/series/types'
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

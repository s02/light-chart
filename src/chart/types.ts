import type { AssetSymbol, Datafeed, ResolutionId } from '@engine/types'

export type DatafeedFactory = {
  create: (assetSymbol: AssetSymbol, resolutionId: ResolutionId, timeZone: string) => Datafeed
}

export type Language = 'ru' | 'en'

export type * from '@engine/types'

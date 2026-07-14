import type { AssetSymbol, Datafeed, ResolutionId, SeriesId } from '@engine/types'

export type DatafeedFactory = {
  create: (assetSymbol: AssetSymbol, resolutionId: ResolutionId, timeZone: string) => Datafeed
}

export type TerminalChartConfig = {
  resolutionId: ResolutionId
  seriesId: SeriesId
}
export type * from '@engine/types'

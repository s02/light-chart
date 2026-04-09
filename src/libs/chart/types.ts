import type { AssetSymbol, Datafeed, ResolutionId, SeriesId } from '@engine/types'

export type DatafeedFactory = (assetSymbol: AssetSymbol, resolutionId: ResolutionId) => Datafeed

export type TerminalChartConfig = {
  resolutionId: ResolutionId
  seriesId: SeriesId
}
export type * from '@engine/types'

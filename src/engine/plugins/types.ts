import type { ResolutionId } from '@engine/types'
import type { ISeriesApi, SeriesType } from 'lightweight-charts'

export type PluginModule = {
  attach(series: ISeriesApi<SeriesType>): void
  detach(): void
  setSeries(series: ISeriesApi<SeriesType>): void
  setResolution(id: ResolutionId): void
}

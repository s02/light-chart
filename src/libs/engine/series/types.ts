import type { ISeriesApi, SeriesType } from 'lightweight-charts'

export interface SeriesOverlay {
  destroy: () => void
  getSeries: () => ISeriesApi<SeriesType>
}

export type SeriesId = 'candlestick' | 'area' | 'bar' | 'line' | 'heikin' | 'hollow'

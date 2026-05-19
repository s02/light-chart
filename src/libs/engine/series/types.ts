import type { Datafeed } from '@engine/types'
import type { BarData, CustomData, HistogramData, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'

export type SeriesOverlayData = BarData<Time> | LineData<Time> | HistogramData<Time> | CustomData<Time>

export interface SeriesOverlay<TData = SeriesOverlayData> {
  destroy(): void
  getSeries(): ISeriesApi<SeriesType>
  getLegend(data: TData): SeriesLegend
  moveToTop(): void
  setDatafeed: (datafeed: Datafeed) => void
}

export type SeriesId = 'candlestick' | 'area' | 'bar' | 'line' | 'heikin' | 'hollow'

export type SeriesLegend = {
  key: string
  paneIndex: number
  data: {
    value: string
    color: string
    label?: string
  }[]
}

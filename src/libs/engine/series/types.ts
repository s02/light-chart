import type { Datafeed } from '@engine/types'
import type { BarData, CustomData, HistogramData, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'

export type SeriesOverlayData = BarData<Time> | LineData<Time> | HistogramData<Time> | CustomData<Time>

export type ChartSeriesLegend = {
  category: 'main' | 'indicators'
  id: number
} & SeriesLegend

export interface SeriesOverlay<TData extends SeriesOverlayData = SeriesOverlayData> {
  destroy(): void
  getSeries(): ISeriesApi<SeriesType>
  getLegend(data: TData): Omit<ChartSeriesLegend, 'category' | 'id'>
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

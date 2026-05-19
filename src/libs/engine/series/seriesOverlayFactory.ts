import { AreaSeriesOverlay } from '@engine/series/AreaSeriesOverlay'
import { BarSeriesOverlay } from '@engine/series/BarSeriesOverlay'
import { CandlestickSeriesOverlay } from '@engine/series/CandlestickSeriesOverlay'
import { HeikinAshiSeriesOverlay } from '@engine/series/HeikinAshiSeriesOverlay'
import { HollowCandleSeriesOverlay } from '@engine/series/HollowCandleSeriesOverlay'
import { LineSeriesOverlay } from '@engine/series/LineSeriesOverlay'
import type { SeriesId, SeriesOverlay } from '@engine/series/types'
import type { Datafeed } from '@engine/types'
import type { IChartApi } from 'lightweight-charts'

const SERIES_REGISTRY: Record<SeriesId, new (chasr: IChartApi, datafeed: Datafeed) => SeriesOverlay> = {
  candlestick: CandlestickSeriesOverlay,
  area: AreaSeriesOverlay,
  bar: BarSeriesOverlay,
  line: LineSeriesOverlay,
  heikin: HeikinAshiSeriesOverlay,
  hollow: HollowCandleSeriesOverlay
}

export const seriesOverlayFactory = (seriesId: SeriesId, chart: IChartApi, datafeed: Datafeed) => {
  const Overlay = SERIES_REGISTRY[seriesId]
  if (Overlay) {
    return new Overlay(chart, datafeed)
  }

  throw new Error(`Unhandled SeriesId: ${String(seriesId)}`)
}

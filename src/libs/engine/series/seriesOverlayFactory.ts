import { AreaSeriesOverlay } from '@engine/series/AreaSeriesOverlay'
import { BarSeriesOverlay } from '@engine/series/BarSeriesOverlay'
import { CandlestickSeriesOverlay } from '@engine/series/CandlestickSeriesOverlay'
import { HeikinAshiSeriesOverlay } from '@engine/series/HeikinAshiSeriesOverlay'
import { LineSeriesOverlay } from '@engine/series/LineSeriesOverlay'
import type { Datafeed, SeriesId } from '@engine/types'
import type { IChartApi } from 'lightweight-charts'

declare function assertNever(val: never): void

export const seriesOverlayFactory = (seriesId: SeriesId, chart: IChartApi, datafeed: Datafeed) => {
  if (seriesId === 'candlestick') {
    return new CandlestickSeriesOverlay(chart, datafeed)
  } else if (seriesId === 'area') {
    return new AreaSeriesOverlay(chart, datafeed)
  } else if (seriesId === 'bar') {
    return new BarSeriesOverlay(chart, datafeed)
  } else if (seriesId === 'line') {
    return new LineSeriesOverlay(chart, datafeed)
  } else if (seriesId === 'heikin') {
    return new HeikinAshiSeriesOverlay(chart, datafeed)
  } else {
    assertNever(seriesId)
  }

  throw `Overlay with this SeriesId doesn't exist`
}

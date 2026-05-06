import { CANDLE_COLORS } from '@engine/constants'
import { AbstractSeriesOverlay } from '@engine/series/AbstractSeriesOverlay'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import type { Datafeed } from '@engine/types'
import { BarSeries, type IChartApi } from 'lightweight-charts'

export class BarSeriesOverlay extends AbstractSeriesOverlay {
  constructor(chart: IChartApi, datafeed: Datafeed) {
    super(chart, datafeed, {
      series: BarSeries,
      options: {
        ...COMMON_SERIES_SETTINGS,
        upColor: CANDLE_COLORS.up,
        downColor: CANDLE_COLORS.down
      }
    })
  }
}

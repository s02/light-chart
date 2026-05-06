import { CANDLE_COLORS } from '@engine/constants'
import { AbstractSeriesOverlay } from '@engine/series/AbstractSeriesOverlay'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import type { Datafeed } from '@engine/types'
import { CandlestickSeries, type IChartApi } from 'lightweight-charts'

export class CandlestickSeriesOverlay extends AbstractSeriesOverlay {
  constructor(chart: IChartApi, datafeed: Datafeed) {
    super(chart, datafeed, {
      series: CandlestickSeries,
      options: {
        ...COMMON_SERIES_SETTINGS,
        upColor: CANDLE_COLORS.up,
        downColor: CANDLE_COLORS.down,
        borderUpColor: CANDLE_COLORS.up,
        borderDownColor: CANDLE_COLORS.down,
        wickUpColor: CANDLE_COLORS.up,
        wickDownColor: CANDLE_COLORS.down
      }
    })
  }
}

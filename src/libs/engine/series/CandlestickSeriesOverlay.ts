import { CANDLE_COLORS } from '@engine/constants'
import { AbstractSeriesOverlay } from '@engine/series/AbstractSeriesOverlay'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { CandlestickSeries } from 'lightweight-charts'
import { formatPrice, getBarColor } from '@engine/helpers'
import type { Datafeed } from '@engine/types'
import type { BarData, IChartApi, Time } from 'lightweight-charts'

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

  getLegend(bar: BarData<Time>) {
    const color = getBarColor(bar)
    return {
      category: 'main',
      paneIndex: 0,
      key: 'candlestick-series',
      data: [
        {
          label: 'O',
          value: formatPrice(bar.open),
          color
        },
        {
          label: 'H',
          value: formatPrice(bar.high),
          color
        },
        {
          label: 'L',
          value: formatPrice(bar.low),
          color
        },
        {
          label: 'C',
          value: formatPrice(bar.close),
          color
        }
      ]
    }
  }
}

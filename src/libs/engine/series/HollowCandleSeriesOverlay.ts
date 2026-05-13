import { CANDLE_COLORS, HOLLOW_CANDLE_COLORS } from '@engine/constants'
import { AbstractSeriesOverlay } from '@engine/series/AbstractSeriesOverlay'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { HollowCandleModel, type HollowBar } from '@engine/series/models/HollowCandleModel'
import { CandlestickSeries } from 'lightweight-charts'
import type { Datafeed, DatafeedResult } from '@engine/types'
import type { BarData, CandlestickData, IChartApi, Time } from 'lightweight-charts'
import { formatPrice, getBarColor } from '@engine/helpers'

export class HollowCandleSeriesOverlay extends AbstractSeriesOverlay {
  #model: HollowCandleModel

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

    this.#model = new HollowCandleModel()
  }

  protected override transformData(result: DatafeedResult) {
    if (result.type === 'set') {
      const data = this.#model.setData(result.data).map((hwbar) => this.getColored(hwbar))
      this.series.setData(data)
    } else {
      result.data.forEach((bar) => {
        const hwbar = this.#model.update(bar)
        this.series.update(this.getColored(hwbar))
      })
    }
  }

  private getColored(bar: HollowBar) {
    const hwbar: CandlestickData = {
      ...bar
    }

    if (bar.isGreenFilled) {
      hwbar.color = HOLLOW_CANDLE_COLORS.up
      hwbar.borderColor = HOLLOW_CANDLE_COLORS.up
    } else if (bar.isRedFilled) {
      hwbar.color = HOLLOW_CANDLE_COLORS.down
      hwbar.borderColor = HOLLOW_CANDLE_COLORS.down
    } else if (bar.isGreenHollow) {
      hwbar.color = HOLLOW_CANDLE_COLORS.hollow
      hwbar.borderColor = HOLLOW_CANDLE_COLORS.up
    } else if (bar.isRedHollow) {
      hwbar.color = HOLLOW_CANDLE_COLORS.hollow
      hwbar.borderColor = HOLLOW_CANDLE_COLORS.down
    }

    return hwbar
  }

  getLegend(bar: BarData<Time>) {
    const color = getBarColor(bar)

    return {
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

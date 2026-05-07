import { CANDLE_COLORS, CHART_PARAMS } from '@engine/constants'
import { AbstractSeriesOverlay } from '@engine/series/AbstractSeriesOverlay'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { HollowCandleModel, type HollowBar } from '@engine/series/models/HollowCandleModel'
import type { Datafeed, DatafeedResult } from '@engine/types'
import { CandlestickSeries, type CandlestickData, type IChartApi } from 'lightweight-charts'

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
      hwbar.color = CANDLE_COLORS.up
      hwbar.borderColor = CANDLE_COLORS.up
    } else if (bar.isRedFilled) {
      hwbar.color = CANDLE_COLORS.down
      hwbar.borderColor = CANDLE_COLORS.down
    } else if (bar.isGreenHollow) {
      hwbar.color = CHART_PARAMS.layout.background.color
      hwbar.borderColor = CANDLE_COLORS.up
    } else if (bar.isRedHollow) {
      hwbar.color = CHART_PARAMS.layout.background.color
      hwbar.borderColor = CANDLE_COLORS.down
    }

    return hwbar
  }
}

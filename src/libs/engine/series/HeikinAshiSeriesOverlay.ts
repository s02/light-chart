import { CANDLE_COLORS } from '@engine/constants'
import { AbstractSeriesOverlay } from '@engine/series/AbstractSeriesOverlay'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { HeikinAshiCalculator } from '@engine/series/HeikinAshiCalculator'
import type { Datafeed, DatafeedResult } from '@engine/types'
import { CandlestickSeries, type IChartApi } from 'lightweight-charts'

export class HeikinAshiSeriesOverlay extends AbstractSeriesOverlay {
  #calculator: HeikinAshiCalculator

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

    this.#calculator = new HeikinAshiCalculator()
  }

  protected override transformData(result: DatafeedResult) {
    if (result.type === 'set') {
      this.series.setData(this.#calculator.setData(result.data))
    } else {
      result.data.forEach((bar) => this.series.update(this.#calculator.update(bar)))
    }
  }
}

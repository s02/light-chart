import { CANDLE_COLORS } from '@engine/constants'
import { AbstractSeriesOverlay } from '@engine/series/AbstractSeriesOverlay'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { HeikinAshiModel } from '@engine/series/models/HeikinAshiModel'
import { CandlestickSeries } from 'lightweight-charts'
import type { Datafeed, DatafeedResult } from '@engine/types'
import type { BarData, IChartApi, Time } from 'lightweight-charts'
import { formatPrice, getBarColor } from '@engine/helpers'

export class HeikinAshiSeriesOverlay extends AbstractSeriesOverlay {
  #model: HeikinAshiModel

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

    this.#model = new HeikinAshiModel()
  }

  protected override transformData(result: DatafeedResult) {
    if (result.type === 'set') {
      const data = this.#model.setData(result.data)
      this.series.setData(data)
    } else {
      result.data.forEach((bar) => this.series.update(this.#model.update(bar)))
    }
  }

  getLegend(bar: BarData<Time>) {
    const color = getBarColor(bar)

    return {
      key: 'heikin-series',
      paneIndex: 0,
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

import { AbstractSeriesOverlay } from '@engine/series/AbstractSeriesOverlay'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { LineSeries } from 'lightweight-charts'
import type { IChartApi, LineData, SingleValueData, Time } from 'lightweight-charts'
import type { ChartBar, Datafeed, DatafeedResult } from '@engine/types'
import { formatPrice } from '@engine/helpers'

export class LineSeriesOverlay extends AbstractSeriesOverlay<LineData<Time>> {
  constructor(chart: IChartApi, datafeed: Datafeed) {
    super(chart, datafeed, {
      series: LineSeries,
      options: {
        lineWidth: 1,
        color: '#26a69a',
        ...COMMON_SERIES_SETTINGS
      }
    })
  }

  protected override transformData(result: DatafeedResult) {
    if (result.type === 'set') {
      const data = result.data.map((bar) => this.getValue(bar))
      this.series.setData(data)
    } else {
      result.data.forEach((bar) => this.series.update(this.getValue(bar)))
    }
  }

  private getValue(bar: ChartBar): SingleValueData {
    return {
      ...bar,
      value: bar.close
    }
  }

  getLegend(data: LineData<Time>) {
    return {
      key: 'line-series',
      paneIndex: 0,
      data: [
        {
          value: formatPrice(data.value),
          color: 'green'
        }
      ]
    }
  }
}

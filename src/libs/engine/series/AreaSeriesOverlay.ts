import { AbstractSeriesOverlay } from '@engine/series/AbstractSeriesOverlay'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { formatPrice } from '@engine/helpers'
import { AreaSeries } from 'lightweight-charts'
import type { IChartApi, LineData, SingleValueData, Time } from 'lightweight-charts'
import type { ChartBar, Datafeed, DatafeedResult } from '@engine/types'

export class AreaSeriesOverlay extends AbstractSeriesOverlay {
  constructor(chart: IChartApi, datafeed: Datafeed) {
    super(chart, datafeed, {
      series: AreaSeries,
      options: {
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
      key: 'area-series',
      data: [
        {
          value: formatPrice(data.value),
          color: 'green'
        }
      ]
    }
  }
}

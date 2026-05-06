import { AbstractSeriesOverlay } from '@engine/series/AbstractSeriesOverlay'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import type { ChartBar, Datafeed, DatafeedResult } from '@engine/types'
import { AreaSeries, type IChartApi, type SingleValueData } from 'lightweight-charts'

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
}

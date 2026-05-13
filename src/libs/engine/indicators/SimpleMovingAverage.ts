import { LineSeries } from 'lightweight-charts'
import { BarQueue } from '@engine/indicators/BarQueue'
import { math } from '@engine/indicators/math'
import { formatPrice } from '@engine/helpers'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time, WhitespaceData } from 'lightweight-charts'
import type { ChartBar, Datafeed, SeriesMap, Indicator } from '@engine/types'

export class SimpleMovingAverage implements Indicator {
  #chart: IChartApi
  #datafeed: Datafeed
  #series: ISeriesApi<SeriesType>
  #subscriptionId?: number
  #length = 20
  #queue: BarQueue

  constructor(chart: IChartApi, datafeed: Datafeed) {
    this.#chart = chart
    this.#datafeed = datafeed
    this.#series = this.#chart.addSeries(LineSeries, { lineWidth: 1, color: 'green' })
    this.#queue = new BarQueue(this.#length)
  }

  async apply() {
    this.#subscriptionId = await this.#datafeed.subscribe((ev) => {
      if (ev.type === 'set') {
        this.#queue = new BarQueue(this.#length)
        const result: (LineData | WhitespaceData)[] = []
        for (const bar of ev.data) {
          this.#queue.push(bar)

          if (this.#queue.isFull()) {
            result.push(this.#createBar(bar))
          } else {
            result.push({
              time: bar.time
            })
          }
        }

        this.#series.setData(result)
      } else {
        for (const bar of ev.data) {
          this.#queue.push(bar)

          if (this.#queue.isFull()) {
            this.#series.update(this.#createBar(bar))
          }
        }
      }
    })
  }

  remove() {
    this.#chart.removeSeries(this.#series)
    if (this.#subscriptionId !== undefined) {
      this.#datafeed.unsubscribe(this.#subscriptionId)
    }
  }

  #createBar(bar: ChartBar) {
    const mean = math.sma(this.#queue.map((bar) => bar.close))
    return {
      time: bar.time,
      value: mean
    }
  }

  getLegend(seriesData: SeriesMap) {
    const data = seriesData.get(this.#series)

    if (data) {
      return {
        key: 'SMA',
        data: [
          {
            value: formatPrice((data as LineData<Time>).value),
            color: 'green'
          }
        ]
      }
    }

    return undefined
  }
}

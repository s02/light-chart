import {
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type SeriesType,
  type WhitespaceData
} from 'lightweight-charts'
import type { Indicator } from './types'
import type { ChartBar, Datafeed } from '@engine/types'

export class SimpleMovingAverage implements Indicator {
  #chart: IChartApi
  #datafeed: Datafeed
  #series: ISeriesApi<SeriesType>
  #subscriptionId?: number
  #length = 20
  #lastPoints: ChartBar[] = []

  constructor(chart: IChartApi, datafeed: Datafeed) {
    this.#chart = chart
    this.#datafeed = datafeed
    this.#series = this.#chart.addSeries(LineSeries)
  }

  async apply() {
    this.#subscriptionId = await this.#datafeed.subscribe((ev) => {
      if (ev.type === 'set') {
        const sma = this.#calculate(ev.data)
        this.#series.setData(sma)
        this.#lastPoints = ev.data.slice(-this.#length)
      } else {
        ev.data.forEach((bar) => {
          this.#lastPoints.shift()
          this.#lastPoints.push(bar)
          const value = this.#getValue(this.#lastPoints, this.#lastPoints.length - 1)
          this.#series.update({
            time: bar.time,
            value
          })
        })
      }
    })
  }

  remove() {
    this.#chart.removeSeries(this.#series)
    if (this.#subscriptionId !== undefined) {
      this.#datafeed.unsubscribe(this.#subscriptionId)
    }
  }

  #getValue(data: ChartBar[], i: number) {
    let sum = 0
    for (let j = 0; j < this.#length; j++) {
      sum += data[i - j].value
    }

    return sum / this.#length
  }

  #calculate(data: ChartBar[]) {
    const result: (LineData | WhitespaceData)[] = []

    for (let i = 0; i < data.length; i++) {
      if (i < this.#length - 1) {
        result.push({
          time: data[i].time
        })
      } else {
        result.push({
          time: data[i].time,
          value: this.#getValue(data, i)
        })
      }
    }

    return result
  }
}

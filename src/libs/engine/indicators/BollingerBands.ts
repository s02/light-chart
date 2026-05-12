import { BarQueue } from '@engine/indicators/BarQueue'
import { math } from '@engine/indicators/math'
import type { Indicator } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import { FillViewPrimitive, type FillPoint } from '@engine/views/FillView'
import {
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type SeriesType,
  type WhitespaceData
} from 'lightweight-charts'

export class BollingerBands implements Indicator {
  #chart: IChartApi
  #datafeed: Datafeed
  #subscriptionId?: number
  #queue: BarQueue
  #fill = new FillViewPrimitive()

  #props = {
    length: 20,
    mul: 2
  }

  #series: {
    upper: ISeriesApi<SeriesType>
    middle: ISeriesApi<SeriesType>
    lower: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed) {
    this.#datafeed = datafeed
    this.#chart = chart
    this.#queue = new BarQueue(this.#props.length)

    this.#series = {
      upper: this.#chart.addSeries(LineSeries, { lineWidth: 1, color: '#2962FF' }),
      middle: this.#chart.addSeries(LineSeries, { lineWidth: 1, color: '#FFAB40' }),
      lower: this.#chart.addSeries(LineSeries, { lineWidth: 1, color: '#2962FF' })
    }

    this.#series.upper.attachPrimitive(this.#fill)
  }

  async apply() {
    this.#subscriptionId = await this.#datafeed.subscribe((ev) => {
      if (ev.type === 'set') {
        this.#queue = new BarQueue(this.#props.length)

        const upper: (LineData | WhitespaceData)[] = []
        const middle: (LineData | WhitespaceData)[] = []
        const lower: (LineData | WhitespaceData)[] = []
        const fill: FillPoint[] = []

        for (const bar of ev.data) {
          this.#queue.push(bar)

          if (this.#queue.isFull()) {
            const bb = this.#createBar(bar)

            upper.push({ time: bb.time, value: bb.upper })
            middle.push({ time: bb.time, value: bb.middle })
            lower.push({ time: bb.time, value: bb.lower })

            fill.push(bb)
          } else {
            upper.push({ time: bar.time })
            middle.push({ time: bar.time })
            lower.push({ time: bar.time })
          }
        }

        this.#series.upper.setData(upper)
        this.#series.middle.setData(middle)
        this.#series.lower.setData(lower)

        this.#fill.set(fill)
      } else {
        for (const bar of ev.data) {
          this.#queue.push(bar)
          const bb = this.#createBar(bar)

          this.#series.upper.update({ time: bb.time, value: bb.upper })
          this.#series.middle.update({ time: bb.time, value: bb.middle })
          this.#series.lower.update({ time: bb.time, value: bb.lower })

          this.#fill.update(bb)
        }
      }
    })
  }

  remove() {
    this.#chart.removeSeries(this.#series.upper)
    this.#chart.removeSeries(this.#series.middle)
    this.#chart.removeSeries(this.#series.lower)

    if (this.#subscriptionId !== undefined) {
      this.#datafeed.unsubscribe(this.#subscriptionId)
    }
  }

  #createBar(bar: ChartBar) {
    const mean = math.sma(this.#queue.map((bar) => bar.close))
    const dev = math.stdev(this.#queue.map((bar) => bar.close)) * this.#props.mul

    return {
      time: bar.time,
      upper: mean + dev,
      middle: mean,
      lower: mean - dev
    }
  }
}

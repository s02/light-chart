import { LineSeries } from 'lightweight-charts'
import type { IChartApi, ISeriesApi, SeriesType, WhitespaceData } from 'lightweight-charts'
import { RESOLUTION_SETTINGS } from '../constants'
import type { ChartBar, Datafeed, UTCTimestamp } from '@engine/types'

const generateWhitespaceData = (lastTime: number, step: number, length: number): WhitespaceData[] =>
  Array.from({ length }, (_, i) => ({
    time: (lastTime + (i + 1) * step) as UTCTimestamp
  }))

export class WhitespaceSeries {
  #series: ISeriesApi<SeriesType>
  #chart: IChartApi
  #datafeed: Datafeed
  #hash = ''
  #subscriptionId?: string

  constructor(chart: IChartApi, datafeed: Datafeed) {
    this.#chart = chart
    this.#datafeed = datafeed
    this.#series = chart.addSeries(LineSeries, {
      lastValueVisible: false,
      priceLineVisible: false,
      priceScaleId: 'whitespace'
    })
    this.#init()
  }

  setDatafeed(datafeed: Datafeed) {
    if (this.#subscriptionId) {
      this.#datafeed.unsubscribe(this.#subscriptionId)
      this.#subscriptionId = undefined
    }
    this.#datafeed = datafeed
    this.#hash = ''
    this.#init()
  }

  destroy() {
    if (this.#subscriptionId) {
      this.#datafeed.unsubscribe(this.#subscriptionId)
    }
    this.#chart.removeSeries(this.#series)
  }

  async #init() {
    this.#subscriptionId = await this.#datafeed.subscribe((result) => this.#update(result.data))
  }

  #update(data: ChartBar[]) {
    if (!data.length) {
      return
    }

    const lastTime = data[data.length - 1].time as number
    const step = RESOLUTION_SETTINGS[this.#datafeed.getResolutionId()].seconds
    const hash = `${lastTime}~${step}`

    if (hash === this.#hash) {
      return
    }

    this.#hash = hash
    const timeRange = this.#chart.timeScale().getVisibleRange()
    if (!timeRange) {
      return
    }

    const diff = (timeRange.to as number) - (timeRange.from as number)
    const candlesCount = Math.round((diff / step) * 2)

    if (this.#series.data.length < candlesCount) {
      this.#series.setData(generateWhitespaceData(lastTime, step, candlesCount))
    }
  }
}

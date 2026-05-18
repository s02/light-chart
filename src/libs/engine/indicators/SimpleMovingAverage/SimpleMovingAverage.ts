import { LineSeries } from 'lightweight-charts'
import { BarQueue } from '@engine/indicators/BarQueue'
import { math } from '@engine/indicators/math'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { indicatorDefaultValues } from '@engine/indicators/schema'
import type { IndicatorSchema, InferIndicatorValues } from '@engine/indicators/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time, WhitespaceData } from 'lightweight-charts'
import type { ChartBar, Datafeed } from '@engine/types'
import type { Indicator, IndicatorName, IndicatorOptions, IndicatorParams, SeriesMap } from '@engine/indicators/types'

const SMA_SCHEMA = {
  inputs: [{ type: 'number', key: 'length', label: 'Length', default: 20, min: 1 }],
  style: [{ type: 'color', key: 'plot', label: 'Plot', default: '#2962FF' }]
} as const satisfies IndicatorSchema

type SMAParams = InferIndicatorValues<typeof SMA_SCHEMA.inputs> & InferIndicatorValues<typeof SMA_SCHEMA.style>

export class SimpleMovingAverage implements Indicator {
  static readonly ikey: IndicatorName = 'sma'

  #chart: IChartApi
  #datafeed: Datafeed
  #series: ISeriesApi<SeriesType>
  #subscriptionId?: string
  #queue: BarQueue
  #paneIndex: number
  #params: SMAParams

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    this.#chart = chart
    this.#datafeed = datafeed
    this.#paneIndex = (options && options.paneIndex) || 0
    this.#params = (options && (options.params as SMAParams)) || {
      ...indicatorDefaultValues(SMA_SCHEMA.inputs),
      ...indicatorDefaultValues(SMA_SCHEMA.style)
    }

    this.#queue = new BarQueue(this.#params.length)
    this.#series = this.#chart.addSeries(
      LineSeries,
      { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.plot },
      this.#paneIndex
    )
  }

  setParams(params: IndicatorParams) {
    this.#params = params as SMAParams
    this.#series.applyOptions({ color: this.#params.plot })
    if (this.#subscriptionId) {
      this.#datafeed.unsubscribe(this.#subscriptionId)
    }
    this.apply()
  }

  setDatafeed(datafeed: Datafeed) {
    if (this.#subscriptionId) {
      this.#datafeed.unsubscribe(this.#subscriptionId)
    }
    this.#datafeed = datafeed
    this.apply()
  }

  getSchema() {
    return {
      ikey: SimpleMovingAverage.ikey,
      schema: SMA_SCHEMA,
      params: this.#params
    }
  }

  async apply() {
    this.#subscriptionId = await this.#datafeed.subscribe((ev) => {
      if (!this.#series) {
        return
      }

      if (ev.type === 'set') {
        this.#queue = new BarQueue(this.#params.length)
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
    }, 'sma')
  }

  remove() {
    if (this.#series) {
      this.#chart.removeSeries(this.#series)
    }

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
    if (!this.#series) {
      return
    }

    const data = seriesData.get(this.#series)

    if (data) {
      return {
        key: SimpleMovingAverage.ikey.toUpperCase(),
        paneIndex: this.#paneIndex,
        data: [
          {
            value: formatPrice((data as LineData<Time>).value),
            color: this.#params.plot
          }
        ]
      }
    }

    return
  }
}

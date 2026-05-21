import { LineSeries } from 'lightweight-charts'
import { BarQueue } from '@engine/indicators/BarQueue'
import { math } from '@engine/indicators/math'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time, WhitespaceData } from 'lightweight-charts'
import type { ChartBar, Datafeed, DatafeedResult } from '@engine/types'
import type { Indicator, IndicatorName, IndicatorOptions, SeriesMap } from '@engine/indicators/types'

const SMA_SCHEMA = {
  inputs: [{ type: 'number', key: 'length', default: 20, min: 1 }],
  style: [{ type: 'color', key: 'color', default: '#2962FF' }]
} as const satisfies StudySchema

type SMAParams = InferStudyValues<typeof SMA_SCHEMA.inputs> & InferStudyValues<typeof SMA_SCHEMA.style>

export class SimpleMovingAverage extends AbstractIndicator implements Indicator {
  static readonly ikey: IndicatorName = 'sma'

  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #queue: BarQueue
  #params: SMAParams

  constructor(chart: IChartApi, datafeed: Datafeed, options?: IndicatorOptions) {
    super(datafeed, options?.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(SMA_SCHEMA.inputs, SMA_SCHEMA.style, options?.params)

    this.#queue = new BarQueue(this.#params.length)
    this.#series = this.#chart.addSeries(
      LineSeries,
      { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.color },
      this.paneIndex
    )
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(SMA_SCHEMA.inputs, SMA_SCHEMA.style, params)
    this.#series.applyOptions({ color: this.#params.color })
    this.reload()
  }

  getSchema() {
    return {
      ikey: SimpleMovingAverage.ikey,
      schema: SMA_SCHEMA,
      params: this.#params
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
        paneIndex: this.paneIndex,
        data: [
          {
            value: formatPrice((data as LineData<Time>).value),
            color: this.#params.color
          }
        ]
      }
    }

    return
  }

  protected onData(ev: DatafeedResult) {
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
  }

  protected removeSeries() {
    if (this.#series) {
      this.#chart.removeSeries(this.#series)
    }
  }

  #createBar(bar: ChartBar) {
    const mean = math.sma(this.#queue.map((bar) => bar.close))
    return {
      time: bar.time,
      value: mean
    }
  }
}

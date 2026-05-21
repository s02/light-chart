import { formatPrice } from '@engine/helpers'
import { BarQueue } from '@engine/indicators/BarQueue'
import { math } from '@engine/indicators/math'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { LineSeries } from 'lightweight-charts'
import { BollingerBandsFill } from '@engine/indicators/BollingerBands/BollingerBandsFill'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time, WhitespaceData } from 'lightweight-charts'
import type { FillPoint } from '@engine/indicators/BollingerBands/BollingerBandsFillRenderer'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { Indicator, IndicatorName, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed, DatafeedResult } from '@engine/types'

const BB_SCHEMA = {
  inputs: [
    { type: 'number', key: 'length', default: 20, min: 1 },
    { type: 'number', key: 'mul', default: 2, min: 0.1, step: 0.1 }
  ],
  style: [
    { type: 'color', key: 'upper', default: '#2962FF' },
    { type: 'color', key: 'middle', default: '#FFAB40' },
    { type: 'color', key: 'lower', default: '#2962FF' },
    { type: 'color', key: 'fill', default: 'rgba(41,98,255,0.1)' }
  ]
} as const satisfies StudySchema

export type BBParams = InferStudyValues<typeof BB_SCHEMA.inputs> & InferStudyValues<typeof BB_SCHEMA.style>

export class BollingerBands extends AbstractIndicator implements Indicator {
  static readonly ikey: IndicatorName = 'bb'

  #chart: IChartApi
  #queue: BarQueue
  #params: BBParams = resolveStudyParams(BB_SCHEMA.inputs, BB_SCHEMA.style)
  #fill = new BollingerBandsFill(this.#params)

  #series: {
    upper: ISeriesApi<SeriesType>
    middle: ISeriesApi<SeriesType>
    lower: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(BB_SCHEMA.inputs, BB_SCHEMA.style, options.params)
    this.#queue = new BarQueue(this.#params.length)

    this.#series = {
      upper: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.upper },
        this.paneIndex
      ),
      middle: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.middle },
        this.paneIndex
      ),
      lower: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.lower },
        this.paneIndex
      )
    }

    this.#series.upper.attachPrimitive(this.#fill)
  }

  getSchema() {
    return {
      ikey: BollingerBands.ikey,
      schema: BB_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(BB_SCHEMA.inputs, BB_SCHEMA.style, params)

    this.#series.upper.applyOptions({ color: this.#params.upper })
    this.#series.middle.applyOptions({ color: this.#params.middle })
    this.#series.lower.applyOptions({ color: this.#params.lower })
    this.#fill.setParams(this.#params)

    this.reload()
  }

  getLegend(seriesData: SeriesMap) {
    const uData = seriesData.get(this.#series.upper)
    const mData = seriesData.get(this.#series.middle)
    const lData = seriesData.get(this.#series.lower)

    if (uData && mData && lData) {
      return {
        key: BollingerBands.ikey.toUpperCase(),
        paneIndex: this.paneIndex,
        data: [
          {
            value: formatPrice((mData as LineData<Time>).value),
            color: this.#params.middle
          },
          {
            value: formatPrice((lData as LineData<Time>).value),
            color: this.#params.upper
          },
          {
            value: formatPrice((uData as LineData<Time>).value),
            color: this.#params.lower
          }
        ]
      }
    }

    return undefined
  }

  protected onData(ev: DatafeedResult) {
    if (ev.type === 'set') {
      this.#queue = new BarQueue(this.#params.length)

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

        if (this.#queue.isFull()) {
          const bb = this.#createBar(bar)

          this.#series.upper.update({ time: bb.time, value: bb.upper })
          this.#series.middle.update({ time: bb.time, value: bb.middle })
          this.#series.lower.update({ time: bb.time, value: bb.lower })

          this.#fill.update(bb)
        }
      }
    }
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.upper)
    this.#chart.removeSeries(this.#series.middle)
    this.#chart.removeSeries(this.#series.lower)
  }

  #createBar(bar: ChartBar) {
    const mean = math.sma(this.#queue.map((bar) => bar.close))
    const dev = math.stdev(this.#queue.map((bar) => bar.close)) * this.#params.mul

    return {
      time: bar.time,
      upper: mean + dev,
      middle: mean,
      lower: mean - dev
    }
  }
}

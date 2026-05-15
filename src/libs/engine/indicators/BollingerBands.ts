import { formatPrice } from '@engine/helpers'
import { BarQueue } from '@engine/indicators/BarQueue'
import { math } from '@engine/indicators/math'
import { FillViewPrimitive, type FillPoint } from '@engine/views/FillView'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { LineSeries } from 'lightweight-charts'
import { indicatorDefaultValues } from '@engine/indicators'
import type {
  ChartBar,
  Datafeed,
  SeriesMap,
  Indicator,
  IndicatorSchema,
  InferIndicatorValues,
  IndicatorParams
} from '@engine/types'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time, WhitespaceData } from 'lightweight-charts'

const BB_SCHEMA = {
  inputs: [
    { type: 'number', key: 'length', label: 'Length', default: 20, min: 1 },
    { type: 'number', key: 'mul', label: 'Multiplier', default: 2, min: 0.1, step: 0.1 }
  ],
  style: [
    { type: 'color', key: 'upperColor', label: 'Upper', default: '#2962FF' },
    { type: 'color', key: 'middleColor', label: 'Middle', default: '#FFAB40' },
    { type: 'color', key: 'lowerColor', label: 'Lower', default: '#2962FF' },
    { type: 'color', key: 'fillColor', label: 'Fill', default: 'rgba(41,98,255,0.1)' }
  ]
} as const satisfies IndicatorSchema

type BBParams = InferIndicatorValues<typeof BB_SCHEMA.inputs> & InferIndicatorValues<typeof BB_SCHEMA.style>

export class BollingerBands implements Indicator {
  static readonly ikey = 'bb'

  #chart: IChartApi
  #datafeed: Datafeed
  #subscriptionId?: number
  #queue: BarQueue
  #fill = new FillViewPrimitive()
  #paneIndex: number
  #params: BBParams = { ...indicatorDefaultValues(BB_SCHEMA.inputs), ...indicatorDefaultValues(BB_SCHEMA.style) }

  #series: {
    upper: ISeriesApi<SeriesType>
    middle: ISeriesApi<SeriesType>
    lower: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, paneIndex = 0) {
    this.#datafeed = datafeed
    this.#chart = chart
    this.#queue = new BarQueue(this.#params.length)
    this.#paneIndex = paneIndex

    this.#series = {
      upper: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.upperColor },
        this.#paneIndex
      ),
      middle: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.middleColor },
        this.#paneIndex
      ),
      lower: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.lowerColor },
        this.#paneIndex
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

  update(params: IndicatorParams) {
    this.#params = params as BBParams
    console.log(this.#params)
    this.remove()
    this.apply()
  }

  async apply() {
    this.#subscriptionId = await this.#datafeed.subscribe((ev) => {
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

  getLegend(seriesData: SeriesMap) {
    const uData = seriesData.get(this.#series.upper)
    const mData = seriesData.get(this.#series.middle)
    const lData = seriesData.get(this.#series.lower)

    if (uData && mData && lData) {
      return {
        key: BollingerBands.ikey.toUpperCase(),
        paneIndex: this.#paneIndex,
        data: [
          {
            value: formatPrice((mData as LineData<Time>).value),
            color: this.#params.middleColor
          },
          {
            value: formatPrice((lData as LineData<Time>).value),
            color: this.#params.upperColor
          },
          {
            value: formatPrice((uData as LineData<Time>).value),
            color: this.#params.lowerColor
          }
        ]
      }
    }

    return undefined
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

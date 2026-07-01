import { LineSeries, LineStyle } from 'lightweight-charts'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { formatPrice } from '@engine/helpers'
import { Series, ta } from 'oakscriptjs'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'

const FISHER_SCHEMA = {
  text: [],
  inputs: [{ type: 'number', key: 'fisher-transform-length', default: 9, min: 1 }],
  style: [
    { type: 'color', key: 'fisher-transform-fisherColor', default: 'rgb(33 150 243)' },
    { type: 'color', key: 'fisher-transform-triggerColor', default: 'rgb(255 109 0)' }
  ]
} as const satisfies StudySchema

type FisherParams = InferStudyValues<typeof FISHER_SCHEMA.inputs> &
  InferStudyValues<typeof FISHER_SCHEMA.style> &
  InferStudyValues<typeof FISHER_SCHEMA.text>

export class FisherTransform extends AbstractIndicator implements Indicator {
  static readonly ikey = 'fisher-transform' as const

  #chart: IChartApi
  #params: FisherParams

  #series: {
    fisher: ISeriesApi<SeriesType>
    trigger: ISeriesApi<SeriesType>
    levels: ISeriesApi<SeriesType>[]
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(FISHER_SCHEMA.inputs, FISHER_SCHEMA.style, FISHER_SCHEMA.text, options?.params)

    const levelOpts = (color: string) => ({
      color,
      lineWidth: 1 as const,
      lineStyle: LineStyle.Dashed,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false
    })

    this.#series = {
      fisher: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['fisher-transform-fisherColor'], priceLineVisible: false },
        this.paneIndex
      ),
      trigger: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['fisher-transform-triggerColor'], priceLineVisible: false },
        this.paneIndex
      ),
      levels: [
        [1.5, '#E91E63'],
        [0.75, '#787B86'],
        [0, '#E91E63'],
        [-0.75, '#787B86'],
        [-1.5, '#E91E63']
      ].map(([, color]) => this.#chart.addSeries(LineSeries, levelOpts(color as string), this.paneIndex))
    }
  }

  getSchema() {
    return {
      ikey: FisherTransform.ikey,
      schema: FISHER_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(FISHER_SCHEMA.inputs, FISHER_SCHEMA.style, FISHER_SCHEMA.text, params)
    this.#series.fisher.applyOptions({ color: this.#params['fisher-transform-fisherColor'] })
    this.#series.trigger.applyOptions({ color: this.#params['fisher-transform-triggerColor'] })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'Fisher Transform', paneIndex: this.paneIndex, data: [] }
    legend.data.push({ value: this.#params['fisher-transform-length'].toString(), color: 'rgb(140, 140, 140)' })
    const entries = [
      [this.#series.fisher, this.#params['fisher-transform-fisherColor']],
      [this.#series.trigger, this.#params['fisher-transform-triggerColor']]
    ] as const
    for (const [series, color] of entries) {
      const data = seriesData.get(series)
      const value = data ? formatPrice((data as LineData<Time>).value) : '∅'
      legend.data.push({ value, color })
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    const { fisher, trigger } = this.#calculate(data)
    const firstTime = data[0].time
    const lastTime = data[data.length - 1].time

    for (const [i, level] of ([1.5, 0.75, 0, -0.75, -1.5] as const).entries()) {
      this.#series.levels[i].setData([
        { time: firstTime, value: level },
        { time: lastTime, value: level }
      ])
    }

    this.#series.fisher.setData(fisher)
    this.#series.trigger.setData(trigger)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.fisher)
    this.#chart.removeSeries(this.#series.trigger)
    for (const s of this.#series.levels) this.#chart.removeSeries(s)
  }

  #calculate(bars: ChartBar[]) {
    const length = this.#params['fisher-transform-length']

    const hl2Arr = bars.map((b) => (b.high + b.low) / 2)
    const hl2Series = Series.fromArray(bars, hl2Arr)

    const highestArr = ta.highest(hl2Series, length).toArray()
    const lowestArr = ta.lowest(hl2Series, length).toArray()

    const fisherArr: number[] = []
    const triggerArr: number[] = []
    let prevValue = 0
    let prevFisher: number | null = null

    for (let i = 0; i < bars.length; i++) {
      const hi = highestArr[i]
      const lo = lowestArr[i]

      if (hi == null || lo == null || isNaN(hi) || isNaN(lo)) {
        fisherArr.push(NaN)
        triggerArr.push(NaN)
        continue
      }

      const range = Math.max(hi - lo, 0.001)
      let value = 0.66 * ((hl2Arr[i] - lo) / range - 0.5) + 0.67 * prevValue
      value = Math.max(-0.999, Math.min(0.999, value))

      const fisher: number = 0.5 * Math.log((1 + value) / Math.max(1 - value, 0.001)) + 0.5 * (prevFisher ?? 0)

      triggerArr.push(prevFisher ?? NaN)
      fisherArr.push(fisher)

      prevValue = value
      prevFisher = fisher
    }

    const toPoint = (value: number, i: number) => ({ time: bars[i].time, value })

    return {
      fisher: this.filter(fisherArr.map(toPoint)),
      trigger: this.filter(triggerArr.map(toPoint))
    }
  }
}

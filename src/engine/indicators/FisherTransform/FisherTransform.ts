import { LineSeries, LineStyle, LineType } from 'lightweight-charts'
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
  inputs: [{ type: 'number', key: 'fisher-transform-length', default: 9, min: 1, max: 9999 }],
  style: [
    {
      type: 'line',
      key: 'fisher-transform-fisherLine',
      default: {
        color: 'rgb(33 150 243)',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        lineType: LineType.Simple
      }
    },
    {
      type: 'line',
      key: 'fisher-transform-triggerLine',
      default: {
        color: 'rgb(255 109 0)',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        lineType: LineType.Simple
      }
    },
    { type: 'number', key: 'fisher-transform-level0', default: 1.5, min: -9999, max: 9999 },
    {
      type: 'line',
      key: 'fisher-transform-level0Line',
      default: {
        color: '#E91E63',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        lineType: LineType.Simple
      }
    },
    { type: 'number', key: 'fisher-transform-level1', default: 0.75, min: -9999, max: 9999 },
    {
      type: 'line',
      key: 'fisher-transform-level1Line',
      default: {
        color: '#787B86',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        lineType: LineType.Simple
      }
    },
    { type: 'number', key: 'fisher-transform-level2', default: 0, min: -9999, max: 9999 },
    {
      type: 'line',
      key: 'fisher-transform-level2Line',
      default: {
        color: '#E91E63',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        lineType: LineType.Simple
      }
    },
    { type: 'number', key: 'fisher-transform-level3', default: -0.75, min: -9999, max: 9999 },
    {
      type: 'line',
      key: 'fisher-transform-level3Line',
      default: {
        color: '#787B86',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        lineType: LineType.Simple
      }
    },
    { type: 'number', key: 'fisher-transform-level4', default: -1.5, min: -9999, max: 9999 },
    {
      type: 'line',
      key: 'fisher-transform-level4Line',
      default: {
        color: '#E91E63',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        lineType: LineType.Simple
      }
    }
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

    this.#series = {
      fisher: this.#chart.addSeries(
        LineSeries,
        {
          ...COMMON_SERIES_SETTINGS,
          ...this.#params['fisher-transform-fisherLine'],
          priceLineVisible: false
        },
        this.paneIndex
      ),
      trigger: this.#chart.addSeries(
        LineSeries,
        {
          ...COMMON_SERIES_SETTINGS,
          ...this.#params['fisher-transform-triggerLine'],
          priceLineVisible: false
        },
        this.paneIndex
      ),
      levels: [
        this.#params['fisher-transform-level0Line'],
        this.#params['fisher-transform-level1Line'],
        this.#params['fisher-transform-level2Line'],
        this.#params['fisher-transform-level3Line'],
        this.#params['fisher-transform-level4Line']
      ].map((opts) =>
        this.#chart.addSeries(
          LineSeries,
          {
            ...opts,
            crosshairMarkerVisible: false,
            lastValueVisible: false,
            priceLineVisible: false
          },
          this.paneIndex
        )
      )
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
    this.#series.fisher.applyOptions(this.#params['fisher-transform-fisherLine'])
    this.#series.trigger.applyOptions(this.#params['fisher-transform-triggerLine'])
    this.#series.levels[0].applyOptions(this.#params['fisher-transform-level0Line'])
    this.#series.levels[1].applyOptions(this.#params['fisher-transform-level1Line'])
    this.#series.levels[2].applyOptions(this.#params['fisher-transform-level2Line'])
    this.#series.levels[3].applyOptions(this.#params['fisher-transform-level3Line'])
    this.#series.levels[4].applyOptions(this.#params['fisher-transform-level4Line'])
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'Fisher Transform', paneIndex: this.paneIndex, data: [] }
    legend.data.push({ value: this.#params['fisher-transform-length'].toString(), color: 'rgb(140, 140, 140)' })
    const entries = [
      [this.#series.fisher, this.#params['fisher-transform-fisherLine'].color],
      [this.#series.trigger, this.#params['fisher-transform-triggerLine'].color]
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

    const levels = [
      this.#params['fisher-transform-level0'],
      this.#params['fisher-transform-level1'],
      this.#params['fisher-transform-level2'],
      this.#params['fisher-transform-level3'],
      this.#params['fisher-transform-level4']
    ]

    for (const [i, level] of levels.entries()) {
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

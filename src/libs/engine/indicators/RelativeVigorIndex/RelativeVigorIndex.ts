import { LineSeries } from 'lightweight-charts'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { formatPrice } from '@engine/helpers'
import { Series, sum, ta } from 'oakscriptjs'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'

const RVI_SCHEMA = {
  text: [],
  inputs: [{ type: 'number', key: 'rvi-length', default: 10, min: 1, max: 9999 }],
  style: [
    { type: 'color', key: 'rvi-rviColor', default: 'rgb(41 98 255)' },
    { type: 'color', key: 'rvi-signalColor', default: 'rgb(255 109 0)' }
  ]
} as const satisfies StudySchema

type RVIParams = InferStudyValues<typeof RVI_SCHEMA.inputs> &
  InferStudyValues<typeof RVI_SCHEMA.style> &
  InferStudyValues<typeof RVI_SCHEMA.text>

export class RelativeVigorIndex extends AbstractIndicator implements Indicator {
  static readonly ikey = 'rvi' as const

  #chart: IChartApi
  #params: RVIParams

  #series: {
    rvi: ISeriesApi<SeriesType>
    signal: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(RVI_SCHEMA.inputs, RVI_SCHEMA.style, RVI_SCHEMA.text, options?.params)

    this.#series = {
      rvi: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['rvi-rviColor'], priceLineVisible: false },
        this.paneIndex
      ),
      signal: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['rvi-signalColor'], priceLineVisible: false },
        this.paneIndex
      )
    }
  }

  getSchema() {
    return {
      ikey: RelativeVigorIndex.ikey,
      schema: RVI_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(RVI_SCHEMA.inputs, RVI_SCHEMA.style, RVI_SCHEMA.text, params)
    this.#series.rvi.applyOptions({ color: this.#params['rvi-rviColor'] })
    this.#series.signal.applyOptions({ color: this.#params['rvi-signalColor'] })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'RVI', paneIndex: this.paneIndex, data: [] }
    legend.data.push({ value: this.#params['rvi-length'].toString(), color: 'rgb(140, 140, 140)' })
    const entries = [
      [this.#series.rvi, this.#params['rvi-rviColor']],
      [this.#series.signal, this.#params['rvi-signalColor']]
    ] as const
    for (const [series, color] of entries) {
      const data = seriesData.get(series)
      const value = data ? formatPrice((data as LineData<Time>).value) : '∅'
      legend.data.push({ value, color })
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    const { rvi, signal } = this.#calculate(data)
    this.#series.rvi.setData(rvi)
    this.#series.signal.setData(signal)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.rvi)
    this.#chart.removeSeries(this.#series.signal)
  }

  #calculate(bars: ChartBar[]) {
    const length = this.#params['rvi-length']

    const closeOpen = new Series(bars, (b) => b.close - b.open)
    const highLow = new Series(bars, (b) => b.high - b.low)

    const numeratorArr = sum(ta.swma(closeOpen).toArray(), length)
    const denominatorArr = sum(ta.swma(highLow).toArray(), length)

    const rviArr = numeratorArr.map((n, i) => {
      const d = denominatorArr[i]
      return d == null || isNaN(d) || d === 0 ? NaN : n / d
    })

    const signalArr = ta.swma(Series.fromArray(bars, rviArr)).toArray()

    const toPoint = (value: number, i: number) => ({ time: bars[i].time, value: isNaN(value) ? NaN : value })

    return {
      rvi: this.filter(rviArr.map(toPoint)),
      signal: this.filter(signalArr.map((v, i) => toPoint(v ?? NaN, i)))
    }
  }
}

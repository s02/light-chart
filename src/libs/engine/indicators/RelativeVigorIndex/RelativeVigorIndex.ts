import { LineSeries, LineStyle } from 'lightweight-charts'
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
  inputs: [{ type: 'number', key: 'length', default: 10, min: 1 }],
  style: [
    { type: 'color', key: 'rviColor', default: 'rgb(41 98 255)' },
    { type: 'color', key: 'signalColor', default: 'rgb(255 109 0)' }
  ]
} as const satisfies StudySchema

type RVIParams = InferStudyValues<typeof RVI_SCHEMA.inputs> & InferStudyValues<typeof RVI_SCHEMA.style>

export class RelativeVigorIndex extends AbstractIndicator implements Indicator {
  static readonly ikey = 'rvi' as const

  #chart: IChartApi
  #params: RVIParams

  #series: {
    rvi: ISeriesApi<SeriesType>
    signal: ISeriesApi<SeriesType>
    zeroLine: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(RVI_SCHEMA.inputs, RVI_SCHEMA.style, options?.params)

    this.#series = {
      rvi: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.rviColor, priceLineVisible: false },
        this.paneIndex
      ),
      signal: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.signalColor, priceLineVisible: false },
        this.paneIndex
      ),
      zeroLine: this.#chart.addSeries(
        LineSeries,
        {
          color: '#787B86',
          lineWidth: 1,
          lineStyle: LineStyle.LargeDashed,
          crosshairMarkerVisible: false,
          lastValueVisible: false,
          priceLineVisible: false
        },
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
    this.#params = resolveStudyParams(RVI_SCHEMA.inputs, RVI_SCHEMA.style, params)
    this.#series.rvi.applyOptions({ color: this.#params.rviColor })
    this.#series.signal.applyOptions({ color: this.#params.signalColor })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'RVI', paneIndex: this.paneIndex, data: [] }
    const entries = [
      [this.#series.rvi, this.#params.rviColor],
      [this.#series.signal, this.#params.signalColor]
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
    const firstTime = data[0].time
    const lastTime = data[data.length - 1].time

    this.#series.zeroLine.setData([
      { time: firstTime, value: 0 },
      { time: lastTime, value: 0 }
    ])
    this.#series.rvi.setData(rvi)
    this.#series.signal.setData(signal)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.rvi)
    this.#chart.removeSeries(this.#series.signal)
    this.#chart.removeSeries(this.#series.zeroLine)
  }

  #calculate(bars: ChartBar[]) {
    const { length } = this.#params

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

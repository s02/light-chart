import { LineSeries } from 'lightweight-charts'
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

const ADX_SCHEMA = {
  inputs: [
    { type: 'number', key: 'adxSmoothing', default: 14, min: 1 },
    { type: 'number', key: 'diLength', default: 14, min: 1 }
  ],
  style: [{ type: 'color', key: 'adxColor', default: 'rgb(126 87 194)' }]
} as const satisfies StudySchema

type ADXParams = InferStudyValues<typeof ADX_SCHEMA.inputs> & InferStudyValues<typeof ADX_SCHEMA.style>

export class ADX extends AbstractIndicator implements Indicator {
  static readonly ikey = 'adx' as const

  #chart: IChartApi
  #params: ADXParams

  #series: {
    adx: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(ADX_SCHEMA.inputs, ADX_SCHEMA.style, options?.params)

    this.#series = {
      adx: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 2, color: this.#params.adxColor, priceLineVisible: false },
        this.paneIndex
      )
    }
  }

  getSchema() {
    return {
      ikey: ADX.ikey,
      schema: ADX_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(ADX_SCHEMA.inputs, ADX_SCHEMA.style, params)
    this.#series.adx.applyOptions({ color: this.#params.adxColor })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'ADX', paneIndex: this.paneIndex, data: [] }
    const entries = [[this.#series.adx, 'ADX', this.#params.adxColor]] as const
    for (const [series, , color] of entries) {
      const data = seriesData.get(series)
      const value = data ? formatPrice((data as LineData<Time>).value) : '∅'
      legend.data.push({ value, color })
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    const { adx } = this.#calculate(data)

    this.#series.adx.setData(adx)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.adx)
  }

  #calculate(bars: ChartBar[]) {
    const { diLength, adxSmoothing } = this.#params

    const smoothedTRArr = ta.rma(ta.tr(bars), diLength).toArray()

    const plusDMArr = bars.map((b, i) => {
      if (i === 0) return NaN
      const up = b.high - bars[i - 1].high
      const down = bars[i - 1].low - b.low
      return up > down && up > 0 ? up : 0
    })

    const minusDMArr = bars.map((b, i) => {
      if (i === 0) return NaN
      const up = b.high - bars[i - 1].high
      const down = bars[i - 1].low - b.low
      return down > up && down > 0 ? down : 0
    })

    const smoothedPlusDM = ta.rma(Series.fromArray(bars, plusDMArr), diLength).toArray()
    const smoothedMinusDM = ta.rma(Series.fromArray(bars, minusDMArr), diLength).toArray()

    const plusDIArr = smoothedPlusDM.map((v, i) => {
      const tr = smoothedTRArr[i]
      return v == null || tr == null || isNaN(v) || isNaN(tr) || tr === 0 ? NaN : (100 * v) / tr
    })

    const minusDIArr = smoothedMinusDM.map((v, i) => {
      const tr = smoothedTRArr[i]
      return v == null || tr == null || isNaN(v) || isNaN(tr) || tr === 0 ? NaN : (100 * v) / tr
    })

    const dxArr = plusDIArr.map((plus, i) => {
      const minus = minusDIArr[i]
      if (isNaN(plus) || isNaN(minus)) return NaN
      const sum = plus + minus
      return sum === 0 ? 0 : Math.abs(plus - minus) / sum
    })

    const adxArr = ta.rma(Series.fromArray(bars, dxArr), adxSmoothing).toArray()

    const toPoint = (value: number | null | undefined, i: number) => ({
      time: bars[i].time,
      value: value == null || isNaN(value) ? NaN : value
    })

    return {
      adx: this.filter(adxArr.map((v, i) => toPoint(v != null && !isNaN(v) ? 100 * v : NaN, i)))
    }
  }
}

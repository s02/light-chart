import { LineSeries } from 'lightweight-charts'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { formatPrice } from '@engine/helpers'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'

const TREND_SCHEMA = {
  inputs: [{ type: 'number', key: 'length', default: 14, min: 2 }],
  style: [{ type: 'color', key: 'color', default: 'rgb(126 87 194)' }]
} as const satisfies StudySchema

type TrendParams = InferStudyValues<typeof TREND_SCHEMA.inputs> & InferStudyValues<typeof TREND_SCHEMA.style>

export class TrendStrengthIndex extends AbstractIndicator implements Indicator {
  static readonly ikey = 'trend-si' as const

  #chart: IChartApi
  #params: TrendParams

  #series: {
    tsi: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(TREND_SCHEMA.inputs, TREND_SCHEMA.style, options?.params)

    this.#series = {
      tsi: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.color, priceLineVisible: false },
        this.paneIndex
      )
    }
  }

  getSchema() {
    return {
      ikey: TrendStrengthIndex.ikey,
      schema: TREND_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(TREND_SCHEMA.inputs, TREND_SCHEMA.style, params)
    this.#series.tsi.applyOptions({ color: this.#params.color })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'Trend Strength Index', paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series.tsi)
    const value = data ? formatPrice((data as LineData<Time>).value) : '∅'
    legend.data.push({ value, color: this.#params.color })
    return legend
  }

  protected onData(data: ChartBar[]) {
    const tsiData = this.#calculate(data)
    this.#series.tsi.setData(tsiData)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.tsi)
  }

  #calculate(bars: ChartBar[]) {
    const { length } = this.#params
    const sumX = ((length - 1) * length) / 2
    const sumXX = ((length - 1) * length * (2 * length - 1)) / 6
    const invN = 1 / length
    const invNSumXSumX = invN * sumX * sumX

    const mapped = bars.map((b, i) => {
      if (i < length - 1) return { time: b.time, value: NaN }

      let sumY = 0
      let sumXY = 0
      let sumYY = 0

      for (let j = 0; j < length; j++) {
        const close = bars[i - length + 1 + j].close
        sumY += close
        sumXY += j * close
        sumYY += close * close
      }

      const a = sumXY - invN * sumX * sumY
      const l = (sumXX - invNSumXSumX) * (sumYY - invN * sumY * sumY)

      const value = l < 0 ? (a === 0 ? 0 : a > 0 ? 1 : -1) : a / Math.sqrt(l)
      return { time: b.time, value }
    })

    return this.filter(mapped)
  }
}

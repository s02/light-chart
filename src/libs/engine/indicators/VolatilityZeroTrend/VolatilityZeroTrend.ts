import { LineSeries } from 'lightweight-charts'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'

const VZT_SCHEMA = {
  inputs: [
    { type: 'number', key: 'period', default: 10, min: 1 },
    { type: 'number', key: 'daysPerYear', default: 252, min: 1 }
  ],
  style: [{ type: 'color', key: 'color', default: 'rgb(255 109 0)' }]
} as const satisfies StudySchema

type VZTParams = InferStudyValues<typeof VZT_SCHEMA.inputs> & InferStudyValues<typeof VZT_SCHEMA.style>

export class VolatilityZeroTrend extends AbstractIndicator implements Indicator {
  static readonly ikey = 'vzt' as const

  #chart: IChartApi
  #params: VZTParams
  #series: ISeriesApi<SeriesType>

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(VZT_SCHEMA.inputs, VZT_SCHEMA.style, options?.params)

    this.#series = this.#chart.addSeries(
      LineSeries,
      { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.color, priceLineVisible: false },
      this.paneIndex
    )
  }

  getSchema() {
    return {
      ikey: VolatilityZeroTrend.ikey,
      schema: VZT_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(VZT_SCHEMA.inputs, VZT_SCHEMA.style, params)
    this.#series.applyOptions({ color: this.#params.color })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'VZT', paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series)
    const value = data ? `${(data as LineData<Time>).value.toFixed(2)}%` : '∅'
    legend.data.push({ value, color: this.#params.color })
    return legend
  }

  protected onData(data: ChartBar[]) {
    this.#series.setData(this.#calculate(data))
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series)
  }

  #calculate(bars: ChartBar[]) {
    const { period, daysPerYear } = this.#params
    const normRetSq: number[] = new Array(bars.length).fill(NaN)

    for (let i = 1; i < bars.length; i++) {
      const timeDiffDays = (bars[i].time - bars[i - 1].time) / 86400
      if (timeDiffDays <= 0) continue
      const timeFactor = Math.sqrt(timeDiffDays / daysPerYear)
      const logReturn = Math.log((bars[i].close as number) / (bars[i - 1].close as number))
      const normalizedReturn = logReturn / timeFactor
      normRetSq[i] = normalizedReturn * normalizedReturn
    }

    return this.filter(
      bars.map((bar, i) => {
        if (i < period) return { time: bar.time, value: NaN }
        let sum = 0
        for (let l = 0; l < period; l++) {
          const v = normRetSq[i - l]
          if (isNaN(v)) return { time: bar.time, value: NaN }
          sum += v
        }
        return { time: bar.time, value: 100 * Math.sqrt(sum / period) }
      })
    )
  }
}

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

const AD_SCHEMA = {
  text: [],
  inputs: [{ type: 'number', key: 'advance-decline-length', default: 10, min: 1, max: 9999 }],
  style: [{ type: 'color', key: 'advance-decline-color', default: 'rgb(33 150 243)' }]
} as const satisfies StudySchema

type ADParams = InferStudyValues<typeof AD_SCHEMA.inputs> &
  InferStudyValues<typeof AD_SCHEMA.style> &
  InferStudyValues<typeof AD_SCHEMA.text>

export class AdvanceDecline extends AbstractIndicator implements Indicator {
  static readonly ikey = 'advance-decline' as const

  #chart: IChartApi
  #params: ADParams

  #series: {
    line: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(AD_SCHEMA.inputs, AD_SCHEMA.style, AD_SCHEMA.text, options?.params)

    this.#series = {
      line: this.#chart.addSeries(
        LineSeries,
        {
          ...COMMON_SERIES_SETTINGS,
          lineWidth: 1,
          color: this.#params['advance-decline-color'],
          priceLineVisible: false
        },
        this.paneIndex
      )
    }
  }

  getSchema() {
    return {
      ikey: AdvanceDecline.ikey,
      schema: AD_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(AD_SCHEMA.inputs, AD_SCHEMA.style, AD_SCHEMA.text, params)
    this.#series.line.applyOptions({ color: this.#params['advance-decline-color'] })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'Advance/Decline', paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series.line)
    const value = data ? formatPrice((data as LineData<Time>).value) : '∅'
    legend.data.push({ value: this.#params['advance-decline-length'].toString(), color: 'rgb(140, 140, 140)' })
    legend.data.push({ value, color: this.#params['advance-decline-color'] })
    return legend
  }

  protected onData(data: ChartBar[]) {
    this.#series.line.setData(this.#calculate(data))
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.line)
  }

  #calculate(bars: ChartBar[]) {
    const length = this.#params['advance-decline-length']

    const result = bars.map((_, i) => {
      if (i < length - 1) return { time: bars[i].time, value: NaN }

      let advances = 0
      let declines = 0
      for (let j = i - length + 1; j <= i; j++) {
        if (bars[j].close > bars[j].open) advances++
        if (bars[j].close < bars[j].open) declines++
      }

      return { time: bars[i].time, value: declines === 0 ? advances : advances / declines }
    })

    return this.filter(result)
  }
}

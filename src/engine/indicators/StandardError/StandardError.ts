import { LineSeries, LineStyle, LineType } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'

const STDERR_SCHEMA = {
  text: [],
  inputs: [{ type: 'number', key: 'stderr-length', default: 14, min: 1, max: 9999 }],
  style: [
    {
      type: 'line',
      key: 'stderr-line',
      default: {
        color: 'rgb(255 109 0)',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        lineType: LineType.Simple
      }
    }
  ]
} as const satisfies StudySchema

type STDERRParams = InferStudyValues<typeof STDERR_SCHEMA.inputs> &
  InferStudyValues<typeof STDERR_SCHEMA.style> &
  InferStudyValues<typeof STDERR_SCHEMA.text>

export class StandardError extends AbstractIndicator implements Indicator {
  static readonly ikey = 'stderr' as const

  #chart: IChartApi
  #params: STDERRParams
  #series: ISeriesApi<SeriesType>

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(STDERR_SCHEMA.inputs, STDERR_SCHEMA.style, STDERR_SCHEMA.text, options?.params)

    this.#series = this.#chart.addSeries(
      LineSeries,
      { ...COMMON_SERIES_SETTINGS, ...this.#params['stderr-line'], priceLineVisible: false },
      this.paneIndex
    )
  }

  getSchema() {
    return {
      ikey: StandardError.ikey,
      schema: STDERR_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(STDERR_SCHEMA.inputs, STDERR_SCHEMA.style, STDERR_SCHEMA.text, params)
    this.#series.applyOptions(this.#params['stderr-line'])
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'STDERR', paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series)
    legend.data.push({ value: this.#params['stderr-length'].toString(), color: 'rgb(140, 140, 140)' })
    if (data) {
      const val = (data as LineData<Time>).value
      legend.data.push({
        value: (Math.round((val + Number.EPSILON) * 100) / 100).toString(),
        color: this.#params['stderr-line'].color
      })
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    this.#series.setData(this.#calculate(data))
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series)
  }

  #calculate(bars: ChartBar[]) {
    const period = this.#params['stderr-length']
    const closes = bars.map((b) => b.close)
    const meanX = (period + 1) / 2
    const sxx = (period * (period * period - 1)) / 12

    const result: number[] = new Array(bars.length).fill(NaN)

    for (let i = period - 1; i < bars.length; i++) {
      let sumY = 0
      for (let l = 0; l < period; l++) sumY += closes[i - l]
      const meanY = sumY / period

      let ssyy = 0
      let sxy = 0
      for (let l = 0; l < period; l++) {
        const y = closes[i - l]
        const x = l + 1
        ssyy += Math.pow(meanY - y, 2)
        sxy += (meanX - x) * (meanY - y)
      }

      result[i] = Math.sqrt((ssyy - (sxy * sxy) / sxx) / (period - 2))
    }

    const toBar = (value: number, i: number) => ({
      time: bars[i].time,
      value
    })

    return this.filter(result.map(toBar))
  }
}

import { LineSeries } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'
import { ta } from 'oakscriptjs'

const SAR_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'sar-start', default: 0.02, min: 0.001, step: 0.01, max: 9999 },
    { type: 'number', key: 'sar-inc', default: 0.02, min: 0.001, step: 0.01, max: 9999 },
    { type: 'number', key: 'sar-max', default: 0.2, min: 0.01, step: 0.01, max: 9999 }
  ],
  style: [{ type: 'color', key: 'sar-color', default: 'rgb(255 255 255)' }]
} as const satisfies StudySchema

type SARParams = InferStudyValues<typeof SAR_SCHEMA.inputs> &
  InferStudyValues<typeof SAR_SCHEMA.style> &
  InferStudyValues<typeof SAR_SCHEMA.text>

export class ParabolicSAR extends AbstractIndicator implements Indicator {
  static readonly ikey = 'sar' as const

  #chart: IChartApi
  #params: SARParams
  #series: ISeriesApi<SeriesType>
  #lastBars: ChartBar[] = []

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(SAR_SCHEMA.inputs, SAR_SCHEMA.style, SAR_SCHEMA.text, options?.params)

    this.#series = this.#chart.addSeries(
      LineSeries,
      { ...COMMON_SERIES_SETTINGS, lineWidth: 1, lineStyle: 3, priceLineVisible: false },
      this.paneIndex
    )
  }

  getSchema() {
    return {
      ikey: ParabolicSAR.ikey,
      schema: SAR_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(SAR_SCHEMA.inputs, SAR_SCHEMA.style, SAR_SCHEMA.text, params)
    if (this.#lastBars.length) {
      this.#series.setData(this.#calculate(this.#lastBars))
    }
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: ParabolicSAR.ikey.toUpperCase(), paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series) as LineData<Time> | undefined
    legend.data.push(
      { value: this.#params['sar-start'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['sar-inc'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['sar-max'].toString(), color: 'rgb(140, 140, 140)' }
    )
    if (data) {
      legend.data.push({ value: formatPrice(data.value), color: this.#params['sar-color'] })
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    this.#lastBars = data
    this.#series.setData(this.#calculate(data))
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series)
  }

  #calculate(bars: ChartBar[]) {
    const sarArr = ta.sar(bars, this.#params['sar-start'], this.#params['sar-inc'], this.#params['sar-max']).toArray()

    return sarArr.map((value, i) => {
      const time = bars[i].time

      if (!value) {
        return { time }
      }

      const dir = value < bars[i].close
      const nextValue = sarArr[i + 1]
      const nextDir = nextValue && nextValue < bars[i + 1]?.close

      const dirChanged = nextValue && dir !== nextDir

      return {
        time,
        value,
        color: dirChanged ? 'transparent' : this.#params['sar-color']
      }
    })
  }
}

import { LineSeries } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorName, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import { ta } from 'oakscriptjs'

const SAR_SCHEMA = {
  inputs: [
    { type: 'number', key: 'start', default: 0.02, min: 0.001, step: 0.01 },
    { type: 'number', key: 'inc', default: 0.02, min: 0.001, step: 0.01 },
    { type: 'number', key: 'max', default: 0.2, min: 0.01, step: 0.01 }
  ],
  style: [{ type: 'color', key: 'color', default: '#ffffff' }]
} as const satisfies StudySchema

type SARParams = InferStudyValues<typeof SAR_SCHEMA.inputs> & InferStudyValues<typeof SAR_SCHEMA.style>

export class ParabolicSAR extends AbstractIndicator implements Indicator {
  static readonly ikey: IndicatorName = 'sar'

  #chart: IChartApi
  #params: SARParams
  #series: ISeriesApi<SeriesType>
  #lastBars: ChartBar[] = []

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(SAR_SCHEMA.inputs, SAR_SCHEMA.style, options?.params)

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
    this.#params = resolveStudyParams(SAR_SCHEMA.inputs, SAR_SCHEMA.style, params)
    if (this.#lastBars.length) {
      this.#series.setData(this.#calculate(this.#lastBars))
    }
  }

  getLegend(seriesData: SeriesMap) {
    const data = seriesData.get(this.#series) as LineData<Time> | undefined

    if (data) {
      return {
        key: ParabolicSAR.ikey.toUpperCase(),
        paneIndex: this.paneIndex,
        data: [{ value: formatPrice(data.value), color: this.#params.color }]
      }
    }

    return
  }

  protected onData(data: ChartBar[]) {
    this.#lastBars = data
    this.#series.setData(this.#calculate(data))
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series)
  }

  #calculate(bars: ChartBar[]) {
    const sarArr = ta.sar(bars, this.#params.start, this.#params.inc, this.#params.max).toArray()

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
        color: dirChanged ? 'transparent' : this.#params.color
      }
    })
  }
}

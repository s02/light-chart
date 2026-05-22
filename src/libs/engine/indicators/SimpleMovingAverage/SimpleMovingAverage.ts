import { LineSeries } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { ChartBar, Datafeed } from '@engine/types'
import type { Indicator, IndicatorName, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import { getSourceSeries, ta } from 'oakscriptjs'

const SMA_SCHEMA = {
  inputs: [{ type: 'number', key: 'length', default: 9, min: 1 }],
  style: [{ type: 'color', key: 'color', default: '#2962FF' }]
} as const satisfies StudySchema

type SMAParams = InferStudyValues<typeof SMA_SCHEMA.inputs> & InferStudyValues<typeof SMA_SCHEMA.style>

export class SimpleMovingAverage extends AbstractIndicator implements Indicator {
  static readonly ikey: IndicatorName = 'sma'

  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #params: SMAParams

  constructor(chart: IChartApi, datafeed: Datafeed, options?: IndicatorOptions) {
    super(datafeed, options?.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(SMA_SCHEMA.inputs, SMA_SCHEMA.style, options?.params)

    this.#series = this.#chart.addSeries(
      LineSeries,
      { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.color, priceLineVisible: false },
      this.paneIndex
    )
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(SMA_SCHEMA.inputs, SMA_SCHEMA.style, params)
    this.#series.applyOptions({ color: this.#params.color })
  }

  getSchema() {
    return {
      ikey: SimpleMovingAverage.ikey,
      schema: SMA_SCHEMA,
      params: this.#params
    }
  }

  getLegend(seriesData: SeriesMap) {
    if (!this.#series) {
      return
    }

    const data = seriesData.get(this.#series)

    if (data) {
      return {
        key: SimpleMovingAverage.ikey.toUpperCase(),
        paneIndex: this.paneIndex,
        data: [
          {
            value: formatPrice((data as LineData<Time>).value),
            color: this.#params.color
          }
        ]
      }
    }

    return
  }

  protected onData(data: ChartBar[]) {
    if (!this.#series) {
      return
    }

    const pp = this.#calculate(data)
    this.#series.setData(pp)
  }

  protected removeSeries() {
    if (this.#series) {
      this.#chart.removeSeries(this.#series)
    }
  }

  #calculate(bars: ChartBar[]) {
    const source = getSourceSeries(bars, 'close')
    const smaResult = ta.sma(source, this.#params.length)

    const toBar = (value: number, i: number) => {
      const time = bars[i].time
      return value
        ? {
            time,
            value
          }
        : {
            time
          }
    }

    return smaResult.toArray().map(toBar)
  }
}

import { LineSeries } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { ChartBar, Datafeed } from '@engine/types'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { SeriesLegend } from '@engine/series'
import { getSourceSeries, ta } from 'oakscriptjs'

const SMA_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'sma-length', default: 9, min: 1, max: 9999 },
    {
      type: 'select',
      key: 'sma-source',
      values: ['close', 'open'],
      default: 'close'
    },
    { type: 'number', key: 'sma-offset', default: 0, min: 0, max: 9999 }
  ],
  style: [{ type: 'color', key: 'sma-color', default: 'rgb(41 98 255)' }]
} as const satisfies StudySchema

type SMAParams = InferStudyValues<typeof SMA_SCHEMA.inputs> &
  InferStudyValues<typeof SMA_SCHEMA.style> &
  InferStudyValues<typeof SMA_SCHEMA.text>

export class SimpleMovingAverage extends AbstractIndicator implements Indicator {
  static readonly ikey = 'sma' as const

  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #params: SMAParams

  constructor(chart: IChartApi, datafeed: Datafeed, options?: IndicatorOptions) {
    super(datafeed, options?.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(SMA_SCHEMA.inputs, SMA_SCHEMA.style, SMA_SCHEMA.text, options?.params)

    this.#series = this.#chart.addSeries(
      LineSeries,
      { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['sma-color'], priceLineVisible: false },
      this.paneIndex
    )
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(SMA_SCHEMA.inputs, SMA_SCHEMA.style, SMA_SCHEMA.text, params)
    this.#series.applyOptions({ color: this.#params['sma-color'] })
  }

  getSchema() {
    return {
      ikey: SimpleMovingAverage.ikey,
      schema: SMA_SCHEMA,
      params: this.#params
    }
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: SimpleMovingAverage.ikey.toUpperCase(), paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series)

    legend.data.push({ value: this.#params['sma-length'].toString(), color: `rgb(140, 140, 140)` })
    legend.data.push({ value: this.#params['sma-source'], color: `rgb(140, 140, 140)` })
    legend.data.push({ value: this.#params['sma-offset'].toString(), color: `rgb(140, 140, 140)` })

    if (data) {
      legend.data.push({ value: formatPrice((data as LineData<Time>).value), color: this.#params['sma-color'] })
    }

    return legend
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
    const source = getSourceSeries(bars, this.#params['sma-source'])
    const maResult = ta.sma(source, this.#params['sma-length'])
    const ma = this.applyOffset(maResult.toArray(), this.#params['sma-offset'])

    const toBar = (value: number, i: number) => ({
      time: bars[i].time,
      value: value ?? NaN
    })

    return this.filter(ma.map(toBar))
  }
}

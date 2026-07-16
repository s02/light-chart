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
import { getSourceSeries, ta } from 'oakscriptjs'

// TODO: Добавить настройки линии сглаживания https://github.com/deepentropy/lightweight-charts-indicators/blob/main/src/standard/ema.ts#L67

const EMA_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'ema-length', default: 9, min: 1, max: 9999 },
    {
      type: 'select',
      key: 'ema-source',
      values: ['close', 'open'],
      default: 'close'
    },
    { type: 'number', key: 'ema-offset', default: 0, min: 0, max: 9999 }
  ],
  style: [{ type: 'color', key: 'ema-color', default: 'rgb(255 109 0)' }]
} as const satisfies StudySchema

type EMAParams = InferStudyValues<typeof EMA_SCHEMA.inputs> &
  InferStudyValues<typeof EMA_SCHEMA.style> &
  InferStudyValues<typeof EMA_SCHEMA.text>

export class ExponentialMovingAverage extends AbstractIndicator implements Indicator {
  static readonly ikey = 'ema' as const

  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #params: EMAParams

  constructor(chart: IChartApi, datafeed: Datafeed, options?: IndicatorOptions) {
    super(datafeed, options?.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(EMA_SCHEMA.inputs, EMA_SCHEMA.style, EMA_SCHEMA.text, options?.params)

    this.#series = this.#chart.addSeries(
      LineSeries,
      { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['ema-color'], priceLineVisible: false },
      this.paneIndex
    )
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(EMA_SCHEMA.inputs, EMA_SCHEMA.style, EMA_SCHEMA.text, params)
    this.#series.applyOptions({ color: this.#params['ema-color'] })
  }

  getSchema() {
    return {
      ikey: ExponentialMovingAverage.ikey,
      schema: EMA_SCHEMA,
      params: this.#params
    }
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = {
      key: ExponentialMovingAverage.ikey.toUpperCase(),
      paneIndex: this.paneIndex,
      data: []
    }
    const data = seriesData.get(this.#series)
    legend.data.push(
      { value: this.#params['ema-length'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['ema-source'], color: 'rgb(140, 140, 140)' },
      { value: this.#params['ema-offset'].toString(), color: 'rgb(140, 140, 140)' }
    )
    if (data) {
      legend.data.push({ value: formatPrice((data as LineData<Time>).value), color: this.#params['ema-color'] })
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
    const source = getSourceSeries(bars, this.#params['ema-source'])
    const shifted = this.applyOffset(ta.ema(source, this.#params['ema-length']).toArray(), this.#params['ema-offset'])

    const toBar = (value: number, i: number) => ({
      time: bars[i].time,
      value: value ?? NaN
    })

    return this.filter(shifted.map(toBar))
  }
}

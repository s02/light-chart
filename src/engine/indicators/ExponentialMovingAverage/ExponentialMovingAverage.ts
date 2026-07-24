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
import { getSourceSeries, ta } from 'oakscriptjs'
import type { Series } from 'oakscriptjs'

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
    { type: 'number', key: 'ema-offset', default: 0, min: 0, max: 9999 },
    {
      type: 'select',
      key: 'ema-smoothing-line',
      values: ['SMA', 'EMA', 'WMA'],
      default: 'SMA'
    },
    { type: 'number', key: 'ema-smoothing-length', default: 9, min: 1, max: 9999 }
  ],
  style: [
    {
      type: 'line',
      key: 'ema-line',
      default: {
        color: 'rgb(255 109 0)',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        lineType: LineType.Simple
      }
    },
    {
      type: 'bool',
      key: 'ema-smoothingLineVisible',
      default: false
    },
    {
      type: 'line',
      key: 'ema-smoothingLine',
      default: {
        color: 'rgb(41 98 255)',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        lineType: LineType.Simple
      }
    }
  ]
} as const satisfies StudySchema

type EMAParams = InferStudyValues<typeof EMA_SCHEMA.inputs> &
  InferStudyValues<typeof EMA_SCHEMA.style> &
  InferStudyValues<typeof EMA_SCHEMA.text>

export class ExponentialMovingAverage extends AbstractIndicator implements Indicator {
  static readonly ikey = 'ema' as const

  #chart: IChartApi
  #series: {
    ema: ISeriesApi<SeriesType>
    smoothing: ISeriesApi<SeriesType>
  }
  #params: EMAParams

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(EMA_SCHEMA.inputs, EMA_SCHEMA.style, EMA_SCHEMA.text, options?.params)

    this.#series = {
      ema: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, ...this.#params['ema-line'], priceLineVisible: false },
        this.paneIndex
      ),
      smoothing: this.#chart.addSeries(
        LineSeries,
        {
          ...COMMON_SERIES_SETTINGS,
          ...this.#params['ema-smoothingLine'],
          priceLineVisible: false,
          lineVisible: this.#params['ema-smoothingLineVisible'],
          crosshairMarkerVisible: this.#params['ema-smoothingLineVisible']
        },
        this.paneIndex
      )
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(EMA_SCHEMA.inputs, EMA_SCHEMA.style, EMA_SCHEMA.text, params)
    this.#series.ema.applyOptions(this.#params['ema-line'])
    this.#series.smoothing.applyOptions({
      ...this.#params['ema-smoothingLine'],
      lineVisible: this.#params['ema-smoothingLineVisible'],
      crosshairMarkerVisible: this.#params['ema-smoothingLineVisible']
    })
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
    const data = seriesData.get(this.#series.ema)
    const smoothingData = seriesData.get(this.#series.smoothing)
    legend.data.push(
      { value: this.#params['ema-length'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['ema-source'], color: 'rgb(140, 140, 140)' },
      { value: this.#params['ema-offset'].toString(), color: 'rgb(140, 140, 140)' }
    )
    if (data) {
      legend.data.push({ value: formatPrice((data as LineData<Time>).value), color: this.#params['ema-line'].color })
    }
    if (smoothingData && this.#params['ema-smoothingLineVisible']) {
      legend.data.push({
        value: formatPrice((smoothingData as LineData<Time>).value),
        color: this.#params['ema-smoothingLine'].color
      })
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    const { ema, smoothing } = this.#calculate(data)
    this.#series.ema.setData(ema)
    this.#series.smoothing.setData(smoothing)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.ema)
    this.#chart.removeSeries(this.#series.smoothing)
  }

  #ma(source: Series, length: number, type: EMAParams['ema-smoothing-line']) {
    if (type === 'EMA') {
      return ta.ema(source, length)
    }
    if (type === 'WMA') {
      return ta.wma(source, length)
    }
    return ta.sma(source, length)
  }

  #calculate(bars: ChartBar[]) {
    const source = getSourceSeries(bars, this.#params['ema-source'])
    const emaSeries = ta.ema(source, this.#params['ema-length'])
    const smoothingSeries = this.#ma(
      emaSeries,
      this.#params['ema-smoothing-length'],
      this.#params['ema-smoothing-line']
    )

    const shiftedEma = this.applyOffset(emaSeries.toArray(), this.#params['ema-offset'])
    const shiftedSmoothing = this.applyOffset(smoothingSeries.toArray(), this.#params['ema-offset'])

    const toBar = (value: number, i: number) => ({
      time: bars[i].time,
      value: value ?? NaN
    })

    return {
      ema: this.filter(shiftedEma.map(toBar)),
      smoothing: this.filter(shiftedSmoothing.map(toBar))
    }
  }
}

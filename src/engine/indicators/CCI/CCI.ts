import { BaselineSeries, LineSeries, LineStyle, LineType } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { Series, ta } from 'oakscriptjs'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'

const PRICE_PRECISION = 2

const CCI_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'cci-length', default: 20, min: 1, max: 9999 },
    {
      type: 'select',
      key: 'cci-smoothing-line',
      values: ['SMA', 'EMA', 'WMA'],
      default: 'SMA'
    },
    { type: 'number', key: 'cci-smoothing-length', default: 20, min: 1, max: 9999 }
  ],
  style: [
    {
      type: 'line',
      key: 'cci-line',
      default: {
        color: 'rgb(126 87 194)',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        lineType: LineType.Simple
      }
    },
    {
      type: 'bool',
      key: 'cci-smoothingLineVisible',
      default: false
    },
    {
      type: 'line',
      key: 'cci-smoothingLine',
      default: {
        color: 'rgb(255 109 0)',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        lineType: LineType.Simple
      }
    },
    { type: 'number', key: 'cci-upperLimit', default: 100, min: -9999, max: 9999 },
    { type: 'number', key: 'cci-lowerLimit', default: -100, min: -9999, max: 9999 },
    { type: 'color', key: 'cci-fill-color', default: 'rgb(41 98 255 / 10%)' }
  ]
} as const satisfies StudySchema

type CCIParams = InferStudyValues<typeof CCI_SCHEMA.inputs> &
  InferStudyValues<typeof CCI_SCHEMA.style> &
  InferStudyValues<typeof CCI_SCHEMA.text>

export class CCI extends AbstractIndicator implements Indicator {
  static readonly ikey = 'cci' as const

  #chart: IChartApi
  #params: CCIParams

  #series: {
    cci: ISeriesApi<SeriesType>
    smoothing: ISeriesApi<SeriesType>
    upperLine: ISeriesApi<SeriesType>
    lowerLine: ISeriesApi<SeriesType>
    fill: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(CCI_SCHEMA.inputs, CCI_SCHEMA.style, CCI_SCHEMA.text, options?.params)

    this.#series = {
      cci: this.#chart.addSeries(
        LineSeries,
        {
          ...COMMON_SERIES_SETTINGS,
          priceFormat: { ...COMMON_SERIES_SETTINGS.priceFormat, precision: PRICE_PRECISION },
          ...this.#params['cci-line'],
          priceLineVisible: false
        },
        this.paneIndex
      ),
      smoothing: this.#chart.addSeries(
        LineSeries,
        {
          ...COMMON_SERIES_SETTINGS,
          ...this.#params['cci-smoothingLine'],
          priceFormat: { ...COMMON_SERIES_SETTINGS.priceFormat, precision: PRICE_PRECISION },
          priceLineVisible: false,
          lineVisible: false
        },
        this.paneIndex
      ),
      upperLine: this.#chart.addSeries(
        LineSeries,
        {
          color: '#787B86',
          lineWidth: 1,
          lineStyle: LineStyle.LargeDashed,
          crosshairMarkerVisible: false,
          lastValueVisible: false,
          priceLineVisible: false
        },
        this.paneIndex
      ),
      lowerLine: this.#chart.addSeries(
        LineSeries,
        {
          color: '#787B86',
          lineWidth: 1,
          lineStyle: LineStyle.LargeDashed,
          crosshairMarkerVisible: false,
          lastValueVisible: false,
          priceLineVisible: false
        },
        this.paneIndex
      ),
      fill: this.#chart.addSeries(
        BaselineSeries,
        {
          baseValue: { type: 'price', price: this.#params['cci-lowerLimit'] },
          topFillColor1: this.#params['cci-fill-color'],
          topFillColor2: this.#params['cci-fill-color'],
          bottomFillColor1: 'transparent',
          bottomFillColor2: 'transparent',
          topLineColor: 'transparent',
          bottomLineColor: 'transparent',
          lineVisible: false,
          lastValueVisible: false,
          priceLineVisible: false,
          crosshairMarkerVisible: false
        },
        this.paneIndex
      )
    }
  }

  getSchema() {
    return {
      ikey: CCI.ikey,
      schema: CCI_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(CCI_SCHEMA.inputs, CCI_SCHEMA.style, CCI_SCHEMA.text, params)
    this.#series.cci.applyOptions(this.#params['cci-line'])
    this.#series.smoothing.applyOptions({
      ...this.#params['cci-smoothingLine'],
      lineVisible: this.#params['cci-smoothingLineVisible']
    })
    this.#series.fill.applyOptions({
      topFillColor1: this.#params['cci-fill-color'],
      topFillColor2: this.#params['cci-fill-color'],
      baseValue: { type: 'price', price: this.#params['cci-lowerLimit'] }
    })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'CCI', paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series.cci)
    const smoothingData = seriesData.get(this.#series.smoothing)
    legend.data.push({ value: this.#params['cci-length'].toString(), color: 'rgb(140, 140, 140)' })
    if (data) {
      legend.data.push({ value: formatPrice((data as LineData<Time>).value), color: this.#params['cci-line'].color })
    }
    if (smoothingData) {
      legend.data.push({
        value: formatPrice((smoothingData as LineData<Time>).value),
        color: this.#params['cci-smoothingLine'].color
      })
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    const { cci, smoothing } = this.#calculate(data)
    const firstTime = data[0].time
    const lastTime = data[data.length - 1].time

    this.#series.upperLine.setData([
      { time: firstTime, value: this.#params['cci-upperLimit'] },
      { time: lastTime, value: this.#params['cci-upperLimit'] }
    ])
    this.#series.lowerLine.setData([
      { time: firstTime, value: this.#params['cci-lowerLimit'] },
      { time: lastTime, value: this.#params['cci-lowerLimit'] }
    ])
    this.#series.fill.setData([
      { time: firstTime, value: this.#params['cci-upperLimit'] },
      { time: lastTime, value: this.#params['cci-upperLimit'] }
    ])
    this.#series.cci.setData(cci)
    this.#series.smoothing.setData(smoothing)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.cci)
    this.#chart.removeSeries(this.#series.smoothing)
    this.#chart.removeSeries(this.#series.upperLine)
    this.#chart.removeSeries(this.#series.lowerLine)
    this.#chart.removeSeries(this.#series.fill)
  }

  #ma(source: Series, length: number, type: CCIParams['cci-smoothing-line']) {
    if (type === 'EMA') {
      return ta.ema(source, length)
    }
    if (type === 'WMA') {
      return ta.wma(source, length)
    }
    return ta.sma(source, length)
  }

  #calculate(bars: ChartBar[]) {
    const typical = new Series(bars, (b) => (b.high + b.low + b.close) / 3)
    const cciSeries = ta.cci(typical, this.#params['cci-length'])
    const smoothingSeries = this.#ma(
      cciSeries,
      this.#params['cci-smoothing-length'],
      this.#params['cci-smoothing-line']
    )

    const cciValues = cciSeries.toArray()
    const smoothingValues = smoothingSeries.toArray()

    return {
      cci: this.filter(cciValues.map((value, i) => ({ time: bars[i].time, value: value ?? NaN }))),
      smoothing: this.filter(smoothingValues.map((value, i) => ({ time: bars[i].time, value: value ?? NaN })))
    }
  }
}

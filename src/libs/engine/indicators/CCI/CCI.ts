import { BaselineSeries, LineSeries, LineStyle } from 'lightweight-charts'
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

const CCI_SCHEMA = {
  text: [],
  inputs: [{ type: 'number', key: 'cci-length', default: 20, min: 1, max: 9999 }],
  style: [
    { type: 'color', key: 'cci-color', default: 'rgb(126 87 194)' },
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
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['cci-color'], priceLineVisible: false },
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
    this.#series.cci.applyOptions({ color: this.#params['cci-color'] })
    this.#series.fill.applyOptions({
      topFillColor1: this.#params['cci-fill-color'],
      topFillColor2: this.#params['cci-fill-color'],
      baseValue: { type: 'price', price: this.#params['cci-lowerLimit'] }
    })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'CCI', paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series.cci)
    legend.data.push({ value: this.#params['cci-length'].toString(), color: 'rgb(140, 140, 140)' })
    if (data) {
      legend.data.push({ value: formatPrice((data as LineData<Time>).value), color: this.#params['cci-color'] })
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    const cciData = this.#calculate(data)
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
    this.#series.cci.setData(cciData)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.cci)
    this.#chart.removeSeries(this.#series.upperLine)
    this.#chart.removeSeries(this.#series.lowerLine)
    this.#chart.removeSeries(this.#series.fill)
  }

  #calculate(bars: ChartBar[]) {
    const typical = new Series(bars, (b) => (b.high + b.low + b.close) / 3)
    const values = ta.cci(typical, this.#params['cci-length']).toArray()

    return this.filter(values.map((value, i) => ({ time: bars[i].time, value: value ?? NaN })))
  }
}

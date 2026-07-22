import { BaselineSeries, LineSeries, LineStyle, LineType } from 'lightweight-charts'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { formatPrice } from '@engine/helpers'
import { getSourceSeries, ta } from 'oakscriptjs'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'

const PRICE_PRECISION = 2

const BBB_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'bbb-length', default: 20, min: 1, max: 9999 },
    { type: 'number', key: 'bbb-mul', default: 2, min: 1, step: 1, max: 9999 }
  ],
  style: [
    {
      type: 'line',
      key: 'bbb-color',
      default: {
        color: 'rgb(126 87 194)',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        lineType: LineType.Simple
      }
    },
    { type: 'color', key: 'bbb-fill-color', default: 'rgb(41 98 255 / 10%)' },
    { type: 'number', key: 'bbb-upperLimit', default: 1, min: -9999, max: 9999 },
    {
      type: 'line',
      key: 'bbb-upperLimit-line',
      default: {
        color: '#787B86',
        lineWidth: 1,
        lineStyle: LineStyle.LargeDashed,
        lineType: LineType.Simple
      }
    },
    { type: 'number', key: 'bbb-lowerLimit', default: 0, min: -9999, max: 9999 },
    {
      type: 'line',
      key: 'bbb-lowerLimit-line',
      default: {
        color: '#787B86',
        lineWidth: 1,
        lineStyle: LineStyle.LargeDashed,
        lineType: LineType.Simple
      }
    }
  ]
} as const satisfies StudySchema

type BBBParams = InferStudyValues<typeof BBB_SCHEMA.inputs> &
  InferStudyValues<typeof BBB_SCHEMA.style> &
  InferStudyValues<typeof BBB_SCHEMA.text>

export class BollingerBandsB extends AbstractIndicator implements Indicator {
  static readonly ikey = 'bbb' as const

  #chart: IChartApi
  #params: BBBParams

  #series: {
    b: ISeriesApi<SeriesType>
    upperLine: ISeriesApi<SeriesType>
    lowerLine: ISeriesApi<SeriesType>
    fill: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(BBB_SCHEMA.inputs, BBB_SCHEMA.style, BBB_SCHEMA.text, options?.params)

    this.#series = {
      b: this.#chart.addSeries(
        LineSeries,
        {
          ...COMMON_SERIES_SETTINGS,
          priceFormat: { ...COMMON_SERIES_SETTINGS.priceFormat, precision: PRICE_PRECISION },
          ...this.#params['bbb-color'],
          priceLineVisible: false
        },
        this.paneIndex
      ),
      upperLine: this.#chart.addSeries(
        LineSeries,
        {
          ...this.#params['bbb-upperLimit-line'],
          crosshairMarkerVisible: false,
          lastValueVisible: false,
          priceLineVisible: false
        },
        this.paneIndex
      ),
      lowerLine: this.#chart.addSeries(
        LineSeries,
        {
          ...this.#params['bbb-lowerLimit-line'],
          crosshairMarkerVisible: false,
          lastValueVisible: false,
          priceLineVisible: false
        },
        this.paneIndex
      ),
      fill: this.#chart.addSeries(
        BaselineSeries,
        {
          baseValue: { type: 'price', price: this.#params['bbb-lowerLimit'] },
          topFillColor1: this.#params['bbb-fill-color'],
          topFillColor2: this.#params['bbb-fill-color'],
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
      ikey: BollingerBandsB.ikey,
      schema: BBB_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(BBB_SCHEMA.inputs, BBB_SCHEMA.style, BBB_SCHEMA.text, params)
    this.#series.b.applyOptions(this.#params['bbb-color'])
    this.#series.upperLine.applyOptions(this.#params['bbb-upperLimit-line'])
    this.#series.lowerLine.applyOptions(this.#params['bbb-lowerLimit-line'])

    this.#series.fill.applyOptions({
      topFillColor1: this.#params['bbb-fill-color'],
      topFillColor2: this.#params['bbb-fill-color'],
      baseValue: { type: 'price', price: this.#params['bbb-lowerLimit'] }
    })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'BB %B', paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series.b)
    const value = data ? formatPrice((data as LineData<Time>).value) : '∅'
    legend.data.push(
      { value: this.#params['bbb-length'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['bbb-mul'].toString(), color: 'rgb(140, 140, 140)' }
    )
    legend.data.push({ value, color: this.#params['bbb-color'].color })
    return legend
  }

  protected onData(data: ChartBar[]) {
    const bData = this.#calculate(data)
    const firstTime = data[0].time
    const lastTime = data[data.length - 1].time

    this.#series.upperLine.setData([
      { time: firstTime, value: this.#params['bbb-upperLimit'] },
      { time: lastTime, value: this.#params['bbb-upperLimit'] }
    ])
    this.#series.lowerLine.setData([
      { time: firstTime, value: this.#params['bbb-lowerLimit'] },
      { time: lastTime, value: this.#params['bbb-lowerLimit'] }
    ])
    this.#series.b.setData(bData)
    this.#series.fill.setData([
      { time: firstTime, value: this.#params['bbb-upperLimit'] },
      { time: lastTime, value: this.#params['bbb-upperLimit'] }
    ])
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.b)
    this.#chart.removeSeries(this.#series.upperLine)
    this.#chart.removeSeries(this.#series.lowerLine)
    this.#chart.removeSeries(this.#series.fill)
  }

  #calculate(bars: ChartBar[]) {
    const source = getSourceSeries(bars, 'close')
    const basis = ta.sma(source, this.#params['bbb-length'])
    const dev = ta.stdev(source, this.#params['bbb-length']).mul(this.#params['bbb-mul'])
    const upper = basis.add(dev)
    const lower = basis.sub(dev)

    const upperArr = upper.toArray()
    const lowerArr = lower.toArray()

    const mapped = bars.map((b, i) => {
      const u = upperArr[i]
      const l = lowerArr[i]
      const bandwidth = u != null && l != null ? u - l : 0
      return {
        time: b.time,
        value: bandwidth === 0 ? NaN : (b.close - (l ?? NaN)) / bandwidth
      }
    })

    return this.filter(mapped)
  }
}

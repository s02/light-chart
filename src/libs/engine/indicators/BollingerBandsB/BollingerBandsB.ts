import { BaselineSeries, LineSeries, LineStyle } from 'lightweight-charts'
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

const BBB_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'bbb-length', default: 20, min: 1 },
    { type: 'number', key: 'bbb-mul', default: 2, min: 1, step: 1 }
  ],
  style: [{ type: 'color', key: 'bbb-color', default: 'rgb(126 87 194)' }]
} as const satisfies StudySchema

type BBBParams = InferStudyValues<typeof BBB_SCHEMA.inputs> &
  InferStudyValues<typeof BBB_SCHEMA.style> &
  InferStudyValues<typeof BBB_SCHEMA.text>

const REF_LINE_OPTIONS = {
  color: '#787B86',
  lineWidth: 1 as const,
  lineStyle: LineStyle.LargeDashed,
  crosshairMarkerVisible: false,
  lastValueVisible: false,
  priceLineVisible: false
}

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
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['bbb-color'], priceLineVisible: false },
        this.paneIndex
      ),
      upperLine: this.#chart.addSeries(LineSeries, REF_LINE_OPTIONS, this.paneIndex),
      lowerLine: this.#chart.addSeries(LineSeries, REF_LINE_OPTIONS, this.paneIndex),
      fill: this.#chart.addSeries(
        BaselineSeries,
        {
          baseValue: { type: 'price', price: 0 },
          topFillColor1: 'rgba(41,98,255,0.1)',
          topFillColor2: 'rgba(41,98,255,0.1)',
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
    this.#series.b.applyOptions({ color: this.#params['bbb-color'] })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'BB %B', paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series.b)
    const value = data ? formatPrice((data as LineData<Time>).value) : '∅'
    legend.data.push(
      { value: this.#params['bbb-length'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['bbb-mul'].toString(), color: 'rgb(140, 140, 140)' }
    )
    legend.data.push({ value, color: this.#params['bbb-color'] })
    return legend
  }

  protected onData(data: ChartBar[]) {
    const bData = this.#calculate(data)
    const firstTime = data[0].time
    const lastTime = data[data.length - 1].time

    this.#series.upperLine.setData([
      { time: firstTime, value: 1 },
      { time: lastTime, value: 1 }
    ])
    this.#series.lowerLine.setData([
      { time: firstTime, value: 0 },
      { time: lastTime, value: 0 }
    ])
    this.#series.b.setData(bData)
    this.#series.fill.setData([
      { time: firstTime, value: 1 },
      { time: lastTime, value: 1 }
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

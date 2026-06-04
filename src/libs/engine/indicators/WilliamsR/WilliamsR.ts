import { LineSeries, LineStyle } from 'lightweight-charts'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { formatPrice } from '@engine/helpers'
import { ta } from 'oakscriptjs'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'

const WPR_SCHEMA = {
  inputs: [{ type: 'number', key: 'length', default: 14, min: 1 }],
  style: [{ type: 'color', key: 'color', default: 'rgb(126 87 194)' }]
} as const satisfies StudySchema

type WPRParams = InferStudyValues<typeof WPR_SCHEMA.inputs> & InferStudyValues<typeof WPR_SCHEMA.style>

export class WilliamsR extends AbstractIndicator implements Indicator {
  static readonly ikey = 'wpr' as const

  #chart: IChartApi
  #params: WPRParams

  #series: {
    wpr: ISeriesApi<SeriesType>
    upperLine: ISeriesApi<SeriesType>
    lowerLine: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(WPR_SCHEMA.inputs, WPR_SCHEMA.style, options?.params)

    const refLineOptions = {
      color: '#787B86',
      lineWidth: 1 as const,
      lineStyle: LineStyle.LargeDashed,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false
    }

    this.#series = {
      wpr: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.color, priceLineVisible: false },
        this.paneIndex
      ),
      upperLine: this.#chart.addSeries(LineSeries, refLineOptions, this.paneIndex),
      lowerLine: this.#chart.addSeries(LineSeries, refLineOptions, this.paneIndex)
    }
  }

  getSchema() {
    return {
      ikey: WilliamsR.ikey,
      schema: WPR_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(WPR_SCHEMA.inputs, WPR_SCHEMA.style, params)
    this.#series.wpr.applyOptions({ color: this.#params.color })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: '%R', paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series.wpr)
    if (data) {
      legend.data.push({ value: formatPrice((data as LineData<Time>).value), color: this.#params.color })
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    const wprData = this.#calculate(data)
    const firstTime = data[0].time
    const lastTime = data[data.length - 1].time

    this.#series.upperLine.setData([
      { time: firstTime, value: -20 },
      { time: lastTime, value: -20 }
    ])
    this.#series.lowerLine.setData([
      { time: firstTime, value: -80 },
      { time: lastTime, value: -80 }
    ])

    this.#series.wpr.setData(wprData)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.wpr)
    this.#chart.removeSeries(this.#series.upperLine)
    this.#chart.removeSeries(this.#series.lowerLine)
  }

  #calculate(bars: ChartBar[]) {
    const wprValues = ta.wpr(bars, this.#params.length).toArray()

    const mapped = wprValues.map((value, i) => ({
      time: bars[i].time,
      value: value ?? NaN
    }))

    return this.filter(mapped)
  }
}

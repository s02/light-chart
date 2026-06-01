import { BaselineSeries, LineSeries, LineStyle } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { getSourceSeries, ta } from 'oakscriptjs'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'

const RSI_SCHEMA = {
  inputs: [{ type: 'number', key: 'length', default: 14, min: 1 }],
  style: [{ type: 'color', key: 'color', default: 'rgb(126 87 194)' }]
} as const satisfies StudySchema

type RSIParams = InferStudyValues<typeof RSI_SCHEMA.inputs> & InferStudyValues<typeof RSI_SCHEMA.style>

export class RSI extends AbstractIndicator implements Indicator {
  static readonly ikey = 'rsi' as const

  #chart: IChartApi
  #params: RSIParams

  #series: {
    rsi: ISeriesApi<SeriesType>
    upperLine: ISeriesApi<SeriesType>
    lowerLine: ISeriesApi<SeriesType>
    fill: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(RSI_SCHEMA.inputs, RSI_SCHEMA.style, options?.params)

    this.#series = {
      rsi: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.color, priceLineVisible: false },
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
          baseValue: { type: 'price', price: 30 },
          topFillColor1: 'rgba(123,31,162,0.1)',
          topFillColor2: 'rgba(123,31,162,0.1)',
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
      ikey: RSI.ikey,
      schema: RSI_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(RSI_SCHEMA.inputs, RSI_SCHEMA.style, params)
    this.#series.rsi.applyOptions({ color: this.#params.color })
  }

  getLegend(seriesData: SeriesMap) {
    const data = seriesData.get(this.#series.rsi)

    if (data) {
      return {
        key: RSI.ikey.toUpperCase(),
        paneIndex: this.paneIndex,
        data: [{ value: formatPrice((data as LineData<Time>).value), color: this.#params.color }]
      }
    }

    return
  }

  protected onData(data: ChartBar[]) {
    const rsiData = this.#calculate(data)

    const firstTime = data[0].time
    const lastTime = data[data.length - 1].time

    this.#series.upperLine.setData([
      { time: firstTime, value: 70 },
      { time: lastTime, value: 70 }
    ])

    this.#series.lowerLine.setData([
      { time: firstTime, value: 30 },
      { time: lastTime, value: 30 }
    ])

    this.#series.fill.setData([
      { time: firstTime, value: 70 },
      { time: lastTime, value: 70 }
    ])

    this.#series.rsi.setData(rsiData)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.rsi)
    this.#chart.removeSeries(this.#series.upperLine)
    this.#chart.removeSeries(this.#series.lowerLine)
    this.#chart.removeSeries(this.#series.fill)
  }

  #calculate(bars: ChartBar[]) {
    const close = getSourceSeries(bars, 'close')
    const rsiValues = ta.rsi(close, this.#params.length)

    const mapped = rsiValues.toArray().map((value, i) => ({
      time: bars[i].time,
      value: value ?? NaN
    }))

    return this.filter(mapped)
  }
}

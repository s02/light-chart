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

const MAD_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'mad-firstLength', default: 14, min: 1, max: 9999 },
    { type: 'number', key: 'mad-secondLength', default: 21, min: 1, max: 9999 },
    {
      type: 'select',
      key: 'mad-method',
      values: ['Simple', 'Exponential', 'Weighted'],
      default: 'Simple'
    }
  ],
  style: [
    {
      type: 'line',
      key: 'mad-plot1',
      default: {
        color: '#FF6D00',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        lineType: LineType.Simple
      }
    },
    {
      type: 'line',
      key: 'mad-plot2',
      default: {
        color: '#2196F3',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        lineType: LineType.Simple
      }
    }
  ]
} as const satisfies StudySchema

type MADParams = InferStudyValues<typeof MAD_SCHEMA.inputs> &
  InferStudyValues<typeof MAD_SCHEMA.style> &
  InferStudyValues<typeof MAD_SCHEMA.text>

export class MovingAverageDouble extends AbstractIndicator implements Indicator {
  static readonly ikey = 'mad' as const

  #chart: IChartApi
  #params: MADParams

  #series: {
    first: ISeriesApi<SeriesType>
    second: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(MAD_SCHEMA.inputs, MAD_SCHEMA.style, MAD_SCHEMA.text, options?.params)

    this.#series = {
      first: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, ...this.#params['mad-plot1'], priceLineVisible: false },
        this.paneIndex
      ),
      second: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, ...this.#params['mad-plot2'], priceLineVisible: false },
        this.paneIndex
      )
    }
  }

  getSchema() {
    return {
      ikey: MovingAverageDouble.ikey,
      schema: MAD_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(MAD_SCHEMA.inputs, MAD_SCHEMA.style, MAD_SCHEMA.text, params)
    this.#series.first.applyOptions(this.#params['mad-plot1'])
    this.#series.second.applyOptions(this.#params['mad-plot2'])
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'MA DOUBLE', paneIndex: this.paneIndex, data: [] }
    const firstData = seriesData.get(this.#series.first)
    const secondData = seriesData.get(this.#series.second)

    legend.data.push(
      { value: this.#params['mad-firstLength'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['mad-secondLength'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['mad-method'], color: 'rgb(140, 140, 140)' }
    )

    if (firstData && secondData) {
      legend.data.push(
        { value: formatPrice((firstData as LineData<Time>).value), color: this.#params['mad-plot1'].color },
        { value: formatPrice((secondData as LineData<Time>).value), color: this.#params['mad-plot2'].color }
      )
    }

    return legend
  }

  protected onData(data: ChartBar[]) {
    const pp = this.#calculate(data)
    this.#series.first.setData(pp.first)
    this.#series.second.setData(pp.second)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.first)
    this.#chart.removeSeries(this.#series.second)
  }

  #ma(source: ReturnType<typeof getSourceSeries>, length: number) {
    switch (this.#params['mad-method']) {
      case 'Exponential':
        return ta.ema(source, length)
      case 'Weighted':
        return ta.wma(source, length)
      default:
        return ta.sma(source, length)
    }
  }

  #calculate(bars: ChartBar[]) {
    const source = getSourceSeries(bars, 'close')
    const firstArr = this.#ma(source, this.#params['mad-firstLength']).toArray()
    const secondArr = this.#ma(source, this.#params['mad-secondLength']).toArray()

    const toBar = (value: number, i: number) => ({
      time: bars[i].time,
      value: value ?? NaN
    })

    return {
      first: this.filter(firstArr.map(toBar)),
      second: this.filter(secondArr.map(toBar))
    }
  }
}

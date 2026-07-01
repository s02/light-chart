import { LineSeries } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { PriceChannelFill } from '@engine/indicators/PriceChannel/PriceChannelFill'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'
import { getSourceSeries, ta } from 'oakscriptjs'

const PC_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'pricechannel-length', default: 20, min: 1, max: 9999 },
    { type: 'number', key: 'pricechannel-offset', default: 0, min: 0, max: 9999 }
  ],
  style: [
    { type: 'color', key: 'pricechannel-upper', default: 'rgb(245 0 87)' },
    { type: 'color', key: 'pricechannel-middle', default: 'rgb(33, 150, 243)' },
    { type: 'color', key: 'pricechannel-lower', default: 'rgb(245 0 87)' },
    { type: 'color', key: 'pricechannel-fill-color', default: 'rgb(41 98 255 / 5%)' }
  ]
} as const satisfies StudySchema

type PCParams = InferStudyValues<typeof PC_SCHEMA.inputs> &
  InferStudyValues<typeof PC_SCHEMA.style> &
  InferStudyValues<typeof PC_SCHEMA.text>

export class PriceChannel extends AbstractIndicator implements Indicator {
  static readonly ikey = 'pricechannel' as const

  #chart: IChartApi
  #params: PCParams
  #fill!: PriceChannelFill

  #series: {
    upper: ISeriesApi<SeriesType>
    middle: ISeriesApi<SeriesType>
    lower: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(PC_SCHEMA.inputs, PC_SCHEMA.style, PC_SCHEMA.text, options?.params)

    this.#series = {
      upper: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['pricechannel-upper'], priceLineVisible: false },
        this.paneIndex
      ),
      middle: this.#chart.addSeries(
        LineSeries,
        {
          ...COMMON_SERIES_SETTINGS,
          lineWidth: 1,
          color: this.#params['pricechannel-middle'],
          priceLineVisible: false
        },
        this.paneIndex
      ),
      lower: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['pricechannel-lower'], priceLineVisible: false },
        this.paneIndex
      )
    }

    this.#fill = new PriceChannelFill(this.#params['pricechannel-fill-color'])
    this.#series.upper.attachPrimitive(this.#fill)
  }

  getSchema() {
    return {
      ikey: PriceChannel.ikey,
      schema: PC_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(PC_SCHEMA.inputs, PC_SCHEMA.style, PC_SCHEMA.text, params)
    this.#series.upper.applyOptions({ color: this.#params['pricechannel-upper'] })
    this.#series.middle.applyOptions({ color: this.#params['pricechannel-middle'] })
    this.#series.lower.applyOptions({ color: this.#params['pricechannel-lower'] })
    this.#fill.setColor(this.#params['pricechannel-fill-color'])
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'PC', paneIndex: this.paneIndex, data: [] }
    const uData = seriesData.get(this.#series.upper)
    const mData = seriesData.get(this.#series.middle)
    const lData = seriesData.get(this.#series.lower)
    legend.data.push(
      { value: this.#params['pricechannel-length'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['pricechannel-offset'].toString(), color: 'rgb(140, 140, 140)' }
    )
    if (uData && mData && lData) {
      legend.data.push(
        { value: formatPrice((uData as LineData<Time>).value), color: this.#params['pricechannel-upper'] },
        { value: formatPrice((lData as LineData<Time>).value), color: this.#params['pricechannel-lower'] },
        { value: formatPrice((mData as LineData<Time>).value), color: this.#params['pricechannel-middle'] }
      )
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    const pp = this.#calculate(data)
    this.#series.upper.setData(pp.upper)
    this.#series.middle.setData(pp.middle)
    this.#series.lower.setData(pp.lower)
    this.#fill.set(pp.upper, pp.lower)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.upper)
    this.#chart.removeSeries(this.#series.middle)
    this.#chart.removeSeries(this.#series.lower)
  }

  #calculate(bars: ChartBar[]) {
    const high = getSourceSeries(bars, 'high')
    const low = getSourceSeries(bars, 'low')

    const upper = ta.highest(high, this.#params['pricechannel-length']).toArray()
    const lower = ta.lowest(low, this.#params['pricechannel-length']).toArray()
    const middle = upper.map((u, i) => {
      const l = lower[i]
      return u !== null && l !== null && !isNaN(u) && !isNaN(l) ? (u + l) / 2 : NaN
    })

    const shifted = {
      upper: this.applyOffset(upper, this.#params['pricechannel-offset']),
      middle: this.applyOffset(middle, this.#params['pricechannel-offset']),
      lower: this.applyOffset(lower, this.#params['pricechannel-offset'])
    }

    const toBar = (value: number, i: number) => ({
      time: bars[i].time,
      value: value ?? NaN
    })

    return {
      upper: this.filter(shifted.upper.map(toBar)),
      middle: this.filter(shifted.middle.map(toBar)),
      lower: this.filter(shifted.lower.map(toBar))
    }
  }
}

import { LineSeries } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { DonchianChannelsFill } from '@engine/indicators/DonchianChannels/DonchianChannelsFill'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'
import { getSourceSeries, ta } from 'oakscriptjs'

const DC_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'donchian-length', default: 20, min: 1, max: 9999 },
    { type: 'number', key: 'donchian-offset', default: 0, min: 0, max: 9999 }
  ],
  style: [
    { type: 'color', key: 'donchian-upper', default: 'rgb(33 150 243)' },
    { type: 'color', key: 'donchian-middle', default: 'rgb(255 109 0)' },
    { type: 'color', key: 'donchian-lower', default: 'rgb(33 150 243)' },
    { type: 'color', key: 'donchian-fill-color', default: 'rgb(41 98 255 / 5%)' }
  ]
} as const satisfies StudySchema

type DCParams = InferStudyValues<typeof DC_SCHEMA.inputs> &
  InferStudyValues<typeof DC_SCHEMA.style> &
  InferStudyValues<typeof DC_SCHEMA.text>

export class DonchianChannels extends AbstractIndicator implements Indicator {
  static readonly ikey = 'donchian' as const

  #chart: IChartApi
  #params: DCParams
  #fill!: DonchianChannelsFill

  #series: {
    upper: ISeriesApi<SeriesType>
    middle: ISeriesApi<SeriesType>
    lower: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(DC_SCHEMA.inputs, DC_SCHEMA.style, DC_SCHEMA.text, options?.params)

    this.#series = {
      upper: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['donchian-upper'], priceLineVisible: false },
        this.paneIndex
      ),
      middle: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['donchian-middle'], priceLineVisible: false },
        this.paneIndex
      ),
      lower: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['donchian-lower'], priceLineVisible: false },
        this.paneIndex
      )
    }

    this.#fill = new DonchianChannelsFill(this.#params['donchian-fill-color'])
    this.#series.upper.attachPrimitive(this.#fill)
  }

  getSchema() {
    return {
      ikey: DonchianChannels.ikey,
      schema: DC_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(DC_SCHEMA.inputs, DC_SCHEMA.style, DC_SCHEMA.text, params)
    this.#series.upper.applyOptions({ color: this.#params['donchian-upper'] })
    this.#series.middle.applyOptions({ color: this.#params['donchian-middle'] })
    this.#series.lower.applyOptions({ color: this.#params['donchian-lower'] })
    this.#fill.setColor(this.#params['donchian-fill-color'])
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'DC', paneIndex: this.paneIndex, data: [] }
    const uData = seriesData.get(this.#series.upper)
    const mData = seriesData.get(this.#series.middle)
    const lData = seriesData.get(this.#series.lower)

    legend.data.push(
      { value: this.#params['donchian-length'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['donchian-offset'].toString(), color: 'rgb(140, 140, 140)' }
    )

    if (uData && mData && lData) {
      legend.data.push(
        { value: formatPrice((lData as LineData<Time>).value), color: this.#params['donchian-lower'] },
        { value: formatPrice((uData as LineData<Time>).value), color: this.#params['donchian-upper'] },
        { value: formatPrice((mData as LineData<Time>).value), color: this.#params['donchian-middle'] }
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

    const upper = ta.highest(high, this.#params['donchian-length']).toArray()
    const lower = ta.lowest(low, this.#params['donchian-length']).toArray()
    const middle = upper.map((u, i) => {
      const l = lower[i]
      return u !== null && l !== null && !isNaN(u) && !isNaN(l) ? (u + l) / 2 : NaN
    })

    const shifted = {
      upper: this.applyOffset(upper, this.#params['donchian-offset']),
      middle: this.applyOffset(middle, this.#params['donchian-offset']),
      lower: this.applyOffset(lower, this.#params['donchian-offset'])
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

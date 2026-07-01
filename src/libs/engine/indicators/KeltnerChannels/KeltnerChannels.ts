import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { LineSeries } from 'lightweight-charts'
import { KeltnerChannelsFill } from '@engine/indicators/KeltnerChannels/KeltnerChannelsFill'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'
import { getSourceSeries, ta } from 'oakscriptjs'

const KC_SCHEMA = {
  text: [],
  inputs: [
    { type: 'bool', key: 'kc-useTrueRange', default: true },
    { type: 'number', key: 'kc-length', default: 20, min: 1 },
    { type: 'number', key: 'kc-mul', default: 1, min: 0.1, step: 0.1 }
  ],
  style: [
    { type: 'color', key: 'kc-upper', default: 'rgb(41 98 255)' },
    { type: 'color', key: 'kc-middle', default: 'rgb(255 171 64)' },
    { type: 'color', key: 'kc-lower', default: 'rgb(41 98 255)' },
    { type: 'color', key: 'kc-fill', default: 'rgb(41 98 255 / 10%)' }
  ]
} as const satisfies StudySchema

export type KCParams = InferStudyValues<typeof KC_SCHEMA.inputs> &
  InferStudyValues<typeof KC_SCHEMA.style> &
  InferStudyValues<typeof KC_SCHEMA.text>

export class KeltnerChannels extends AbstractIndicator implements Indicator {
  static readonly ikey = 'kc' as const

  #chart: IChartApi
  #params: KCParams = resolveStudyParams(KC_SCHEMA.inputs, KC_SCHEMA.style, KC_SCHEMA.text)
  #fill = new KeltnerChannelsFill(this.#params['kc-fill'])

  #series: {
    upper: ISeriesApi<SeriesType>
    middle: ISeriesApi<SeriesType>
    lower: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(KC_SCHEMA.inputs, KC_SCHEMA.style, KC_SCHEMA.text, options.params)

    this.#series = {
      upper: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['kc-upper'], priceLineVisible: false },
        this.paneIndex
      ),
      middle: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['kc-middle'], priceLineVisible: false },
        this.paneIndex
      ),
      lower: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['kc-lower'], priceLineVisible: false },
        this.paneIndex
      )
    }

    this.#series.upper.attachPrimitive(this.#fill)
  }

  getSchema() {
    return {
      ikey: KeltnerChannels.ikey,
      schema: KC_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(KC_SCHEMA.inputs, KC_SCHEMA.style, KC_SCHEMA.text, params)

    this.#series.upper.applyOptions({ color: this.#params['kc-upper'] })
    this.#series.middle.applyOptions({ color: this.#params['kc-middle'] })
    this.#series.lower.applyOptions({ color: this.#params['kc-lower'] })
    this.#fill.fill = this.#params['kc-fill']
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'KC', paneIndex: this.paneIndex, data: [] }
    const uData = seriesData.get(this.#series.upper)
    const mData = seriesData.get(this.#series.middle)
    const lData = seriesData.get(this.#series.lower)

    legend.data.push(
      { value: this.#params['kc-length'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['kc-mul'].toString(), color: 'rgb(140, 140, 140)' }
    )

    if (uData && mData && lData) {
      legend.data.push(
        { value: formatPrice((mData as LineData<Time>).value), color: this.#params['kc-middle'] },
        { value: formatPrice((uData as LineData<Time>).value), color: this.#params['kc-upper'] },
        { value: formatPrice((lData as LineData<Time>).value), color: this.#params['kc-lower'] }
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
    const source = getSourceSeries(bars, 'close')
    const basis = ta.ema(source, this.#params['kc-length'])
    console.log(this.#params['kc-useTrueRange'])
    const trSeries = this.#params['kc-useTrueRange']
      ? ta.tr(bars)
      : getSourceSeries(bars, 'high').sub(getSourceSeries(bars, 'low'))
    const range = ta.ema(trSeries, this.#params['kc-length']).mul(this.#params['kc-mul'])
    const upper = basis.add(range)
    const lower = basis.sub(range)

    const toBar = (value: number, i: number) => {
      const time = bars[i].time
      return value
        ? {
            time,
            value
          }
        : {
            time
          }
    }

    return {
      upper: upper.toArray().map(toBar),
      middle: basis.toArray().map(toBar),
      lower: lower.toArray().map(toBar)
    }
  }
}

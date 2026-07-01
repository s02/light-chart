import { LineSeries } from 'lightweight-charts'
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

const ALLIGATOR_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'alligator-jawLength', default: 21, min: 1, max: 9999 },
    { type: 'number', key: 'alligator-jawOffset', default: 8, min: 0, max: 9999 },
    { type: 'number', key: 'alligator-teethLength', default: 13, min: 1, max: 9999 },
    { type: 'number', key: 'alligator-teethOffset', default: 5, min: 0, max: 9999 },
    { type: 'number', key: 'alligator-lipsLength', default: 8, min: 1, max: 9999 },
    { type: 'number', key: 'alligator-lipsOffset', default: 3, min: 0, max: 9999 }
  ],
  style: [
    { type: 'color', key: 'alligator-jaw', default: 'rgb(33 150 243)' },
    { type: 'color', key: 'alligator-teeth', default: 'rgb(242 54 69)' },
    { type: 'color', key: 'alligator-lips', default: 'rgb(76 175 80)' }
  ]
} as const satisfies StudySchema

type AlligatorParams = InferStudyValues<typeof ALLIGATOR_SCHEMA.inputs> &
  InferStudyValues<typeof ALLIGATOR_SCHEMA.style> &
  InferStudyValues<typeof ALLIGATOR_SCHEMA.text>

export class WilliamsAlligator extends AbstractIndicator implements Indicator {
  static readonly ikey = 'alligator' as const

  #chart: IChartApi
  #params: AlligatorParams

  #series: {
    jaw: ISeriesApi<SeriesType>
    teeth: ISeriesApi<SeriesType>
    lips: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(
      ALLIGATOR_SCHEMA.inputs,
      ALLIGATOR_SCHEMA.style,
      ALLIGATOR_SCHEMA.text,
      options?.params
    )

    this.#series = {
      jaw: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['alligator-jaw'], priceLineVisible: false },
        this.paneIndex
      ),
      teeth: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['alligator-teeth'], priceLineVisible: false },
        this.paneIndex
      ),
      lips: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['alligator-lips'], priceLineVisible: false },
        this.paneIndex
      )
    }
  }

  getSchema() {
    return {
      ikey: WilliamsAlligator.ikey,
      schema: ALLIGATOR_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(ALLIGATOR_SCHEMA.inputs, ALLIGATOR_SCHEMA.style, ALLIGATOR_SCHEMA.text, params)
    this.#series.jaw.applyOptions({ color: this.#params['alligator-jaw'] })
    this.#series.teeth.applyOptions({ color: this.#params['alligator-teeth'] })
    this.#series.lips.applyOptions({ color: this.#params['alligator-lips'] })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'ALLIGATOR', paneIndex: this.paneIndex, data: [] }
    const jawData = seriesData.get(this.#series.jaw)
    const teethData = seriesData.get(this.#series.teeth)
    const lipsData = seriesData.get(this.#series.lips)

    legend.data.push(
      { value: this.#params['alligator-jawLength'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['alligator-teethLength'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['alligator-lipsLength'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['alligator-jawOffset'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['alligator-teethOffset'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['alligator-lipsOffset'].toString(), color: 'rgb(140, 140, 140)' }
    )

    if (jawData && teethData && lipsData) {
      legend.data.push(
        { value: formatPrice((jawData as LineData<Time>).value), color: this.#params['alligator-jaw'] },
        { value: formatPrice((teethData as LineData<Time>).value), color: this.#params['alligator-teeth'] },
        { value: formatPrice((lipsData as LineData<Time>).value), color: this.#params['alligator-lips'] }
      )
    }

    return legend
  }

  protected onData(data: ChartBar[]) {
    const pp = this.#calculate(data)
    this.#series.jaw.setData(pp.jaw)
    this.#series.teeth.setData(pp.teeth)
    this.#series.lips.setData(pp.lips)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.jaw)
    this.#chart.removeSeries(this.#series.teeth)
    this.#chart.removeSeries(this.#series.lips)
  }

  #calculate(bars: ChartBar[]) {
    const hl2 = getSourceSeries(bars, 'hl2')

    const smma = {
      jaw: ta.rma(hl2, this.#params['alligator-jawLength']).toArray(),
      teeth: ta.rma(hl2, this.#params['alligator-teethLength']).toArray(),
      lips: ta.rma(hl2, this.#params['alligator-lipsLength']).toArray()
    }

    const shifted = {
      jaw: this.applyOffset(smma.jaw, this.#params['alligator-jawOffset']),
      teeth: this.applyOffset(smma.teeth, this.#params['alligator-teethOffset']),
      lips: this.applyOffset(smma.lips, this.#params['alligator-lipsOffset'])
    }

    const toBar = (value: number, i: number) => ({
      time: bars[i].time,
      value: value ?? NaN
    })

    return {
      jaw: this.filter(shifted.jaw.map(toBar)),
      teeth: this.filter(shifted.teeth.map(toBar)),
      lips: this.filter(shifted.lips.map(toBar))
    }
  }
}

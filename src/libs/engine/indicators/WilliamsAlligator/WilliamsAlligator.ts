import { LineSeries } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import { getSourceSeries, ta } from 'oakscriptjs'

const ALLIGATOR_SCHEMA = {
  inputs: [
    { type: 'number', key: 'jawLength', default: 21, min: 1 },
    { type: 'number', key: 'jawOffset', default: 8, min: 0 },
    { type: 'number', key: 'teethLength', default: 8, min: 1 },
    { type: 'number', key: 'teethOffset', default: 5, min: 0 },
    { type: 'number', key: 'lipsLength', default: 8, min: 1 },
    { type: 'number', key: 'lipsOffset', default: 3, min: 0 }
  ],
  style: [
    { type: 'color', key: 'jaw', default: 'rgb(33 150 243)' },
    { type: 'color', key: 'teeth', default: 'rgb(242 54 69)' },
    { type: 'color', key: 'lips', default: 'rgb(76 175 80)' }
  ]
} as const satisfies StudySchema

type AlligatorParams = InferStudyValues<typeof ALLIGATOR_SCHEMA.inputs> &
  InferStudyValues<typeof ALLIGATOR_SCHEMA.style>

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
    this.#params = resolveStudyParams(ALLIGATOR_SCHEMA.inputs, ALLIGATOR_SCHEMA.style, options?.params)

    this.#series = {
      jaw: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.jaw, priceLineVisible: false },
        this.paneIndex
      ),
      teeth: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.teeth, priceLineVisible: false },
        this.paneIndex
      ),
      lips: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.lips, priceLineVisible: false },
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
    this.#params = resolveStudyParams(ALLIGATOR_SCHEMA.inputs, ALLIGATOR_SCHEMA.style, params)
    this.#series.jaw.applyOptions({ color: this.#params.jaw })
    this.#series.teeth.applyOptions({ color: this.#params.teeth })
    this.#series.lips.applyOptions({ color: this.#params.lips })
  }

  getLegend(seriesData: SeriesMap) {
    const jawData = seriesData.get(this.#series.jaw)
    const teethData = seriesData.get(this.#series.teeth)
    const lipsData = seriesData.get(this.#series.lips)

    if (jawData && teethData && lipsData) {
      return {
        key: 'ALLIGATOR',
        paneIndex: this.paneIndex,
        data: [
          { value: formatPrice((jawData as LineData<Time>).value), color: this.#params.jaw },
          { value: formatPrice((teethData as LineData<Time>).value), color: this.#params.teeth },
          { value: formatPrice((lipsData as LineData<Time>).value), color: this.#params.lips }
        ]
      }
    }

    return
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
      jaw: ta.rma(hl2, this.#params.jawLength).toArray(),
      teeth: ta.rma(hl2, this.#params.teethLength).toArray(),
      lips: ta.rma(hl2, this.#params.lipsLength).toArray()
    }

    const applyOffset = (values: number[], offset: number): number[] => {
      const result: number[] = new Array(values.length).fill(NaN)
      for (let i = 0; i < values.length - offset; i++) {
        result[i + offset] = values[i]
      }
      return result
    }

    const shifted = {
      jaw: applyOffset(smma.jaw, this.#params.jawOffset),
      teeth: applyOffset(smma.teeth, this.#params.teethOffset),
      lips: applyOffset(smma.lips, this.#params.lipsOffset)
    }

    const toBar = (value: number, i: number) => ({
      time: bars[i].time,
      value: value ?? NaN
    })

    console.log({
      jaw: this.filter(shifted.jaw.map(toBar)),
      teeth: this.filter(shifted.teeth.map(toBar)),
      lips: this.filter(shifted.lips.map(toBar))
    })

    return {
      jaw: this.filter(shifted.jaw.map(toBar)),
      teeth: this.filter(shifted.teeth.map(toBar)),
      lips: this.filter(shifted.lips.map(toBar))
    }
  }
}

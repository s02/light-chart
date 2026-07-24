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

const ALMA_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'alma-length', default: 9, min: 1, max: 9999 },
    { type: 'number', key: 'alma-offset', default: 0.85, min: 0, max: 1 },
    { type: 'number', key: 'alma-sigma', default: 6, min: 1, max: 9999 }
  ],
  style: [
    {
      type: 'line',
      key: 'alma-line',
      default: {
        color: 'rgb(255 109 0)',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        lineType: LineType.Simple
      }
    }
  ]
} as const satisfies StudySchema

type ALMAParams = InferStudyValues<typeof ALMA_SCHEMA.inputs> &
  InferStudyValues<typeof ALMA_SCHEMA.style> &
  InferStudyValues<typeof ALMA_SCHEMA.text>

export class ArnaudLegouxMA extends AbstractIndicator implements Indicator {
  static readonly ikey = 'alma' as const

  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #params: ALMAParams

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(ALMA_SCHEMA.inputs, ALMA_SCHEMA.style, ALMA_SCHEMA.text, options?.params)

    this.#series = this.#chart.addSeries(
      LineSeries,
      { ...COMMON_SERIES_SETTINGS, ...this.#params['alma-line'], priceLineVisible: false },
      this.paneIndex
    )
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(ALMA_SCHEMA.inputs, ALMA_SCHEMA.style, ALMA_SCHEMA.text, params)
    this.#series.applyOptions(this.#params['alma-line'])
  }

  getSchema() {
    return {
      ikey: ArnaudLegouxMA.ikey,
      schema: ALMA_SCHEMA,
      params: this.#params
    }
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'ALMA', paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series)
    legend.data.push(
      { value: this.#params['alma-length'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['alma-offset'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['alma-sigma'].toString(), color: 'rgb(140, 140, 140)' }
    )
    if (data) {
      legend.data.push({ value: formatPrice((data as LineData<Time>).value), color: this.#params['alma-line'].color })
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    this.#series.setData(this.#calculate(data))
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series)
  }

  #calculate(bars: ChartBar[]) {
    const source = getSourceSeries(bars, 'close')
    const almaArr = ta
      .alma(source, this.#params['alma-length'], this.#params['alma-offset'], this.#params['alma-sigma'], true)
      .toArray()

    const toBar = (value: number, i: number) => ({
      time: bars[i].time,
      value: value ?? NaN
    })

    return this.filter(almaArr.map(toBar))
  }
}

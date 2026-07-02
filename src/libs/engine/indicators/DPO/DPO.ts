import { LineSeries, LineStyle } from 'lightweight-charts'
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

const DPO_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'dpo-length', default: 21, min: 1, max: 9999 },
    { type: 'bool', key: 'dpo-mode', default: false }
  ],
  style: [
    { type: 'color', key: 'dpo-color', default: 'rgb(126 87 194)' },
    { type: 'number', key: 'dpo-zero', default: 0, min: -9999, max: 9999 }
  ]
} as const satisfies StudySchema

type DPOParams = InferStudyValues<typeof DPO_SCHEMA.inputs> &
  InferStudyValues<typeof DPO_SCHEMA.style> &
  InferStudyValues<typeof DPO_SCHEMA.text>

export class DPO extends AbstractIndicator implements Indicator {
  static readonly ikey = 'dpo' as const

  #chart: IChartApi
  #params: DPOParams

  #series: {
    dpo: ISeriesApi<SeriesType>
    zero: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(DPO_SCHEMA.inputs, DPO_SCHEMA.style, DPO_SCHEMA.text, options?.params)

    this.#series = {
      dpo: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['dpo-color'], priceLineVisible: false },
        this.paneIndex
      ),
      zero: this.#chart.addSeries(
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
      )
    }
  }

  getSchema() {
    return {
      ikey: DPO.ikey,
      schema: DPO_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(DPO_SCHEMA.inputs, DPO_SCHEMA.style, DPO_SCHEMA.text, params)
    this.#series.dpo.applyOptions({ color: this.#params['dpo-color'] })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'DPO', paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series.dpo)
    const value = data ? formatPrice((data as LineData<Time>).value) : '∅'

    legend.data.push(
      { value: this.#params['dpo-length'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['dpo-mode'] ? 'centered' : 'not centered', color: 'rgb(140, 140, 140)' }
    )

    legend.data.push({ value, color: this.#params['dpo-color'] })
    return legend
  }

  protected onData(data: ChartBar[]) {
    const dpoData = this.#calculate(data)
    const firstTime = data[0].time
    const lastTime = data[data.length - 1].time

    this.#series.zero.setData([
      { time: firstTime, value: this.#params['dpo-zero'] },
      { time: lastTime, value: this.#params['dpo-zero'] }
    ])
    this.#series.dpo.setData(dpoData)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.dpo)
    this.#chart.removeSeries(this.#series.zero)
  }

  #calculate(bars: ChartBar[]) {
    const length = this.#params['dpo-length']
    const offset = Math.floor(length / 2) + 1
    const source = getSourceSeries(bars, 'close')
    const smaArr = ta.sma(source, length).toArray()
    const centered = this.#params['dpo-mode']

    const mapped = bars.map((b, i) => {
      if (centered) {
        const sma = smaArr[i + offset]
        return { time: b.time, value: sma == null ? NaN : b.close - sma }
      } else {
        const sma = i >= offset ? smaArr[i - offset] : null
        return { time: b.time, value: sma == null ? NaN : b.close - sma }
      }
    })

    return this.filter(mapped)
  }
}

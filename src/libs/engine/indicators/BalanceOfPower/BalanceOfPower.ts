import { LineSeries, LineStyle } from 'lightweight-charts'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { formatPrice } from '@engine/helpers'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'

const BOP_SCHEMA = {
  text: [],
  inputs: [],
  style: [{ type: 'color', key: 'bop-color', default: 'rgb(126 87 194)' }]
} as const satisfies StudySchema

type BOPParams = InferStudyValues<typeof BOP_SCHEMA.inputs> &
  InferStudyValues<typeof BOP_SCHEMA.style> &
  InferStudyValues<typeof BOP_SCHEMA.text>

export class BalanceOfPower extends AbstractIndicator implements Indicator {
  static readonly ikey = 'bop' as const

  #chart: IChartApi
  #params: BOPParams

  #series: {
    bop: ISeriesApi<SeriesType>
    zeroLine: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(BOP_SCHEMA.inputs, BOP_SCHEMA.style, BOP_SCHEMA.text, options?.params)

    this.#series = {
      bop: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['bop-color'], priceLineVisible: false },
        this.paneIndex
      ),
      zeroLine: this.#chart.addSeries(
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
      ikey: BalanceOfPower.ikey,
      schema: BOP_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(BOP_SCHEMA.inputs, BOP_SCHEMA.style, BOP_SCHEMA.text, params)
    this.#series.bop.applyOptions({ color: this.#params['bop-color'] })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'BOP', paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series.bop)
    const value = data ? formatPrice((data as LineData<Time>).value) : '∅'
    legend.data.push({ value, color: this.#params['bop-color'] })
    return legend
  }

  protected onData(data: ChartBar[]) {
    const bopData = this.#calculate(data)
    const firstTime = data[0].time
    const lastTime = data[data.length - 1].time

    this.#series.zeroLine.setData([
      { time: firstTime, value: 0 },
      { time: lastTime, value: 0 }
    ])
    this.#series.bop.setData(bopData)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.bop)
    this.#chart.removeSeries(this.#series.zeroLine)
  }

  #calculate(bars: ChartBar[]) {
    const mapped = bars.map((b) => {
      const range = b.high - b.low
      return {
        time: b.time,
        value: range === 0 ? NaN : (b.close - b.open) / range
      }
    })

    return this.filter(mapped)
  }
}

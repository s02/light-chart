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

const MOM_SCHEMA = {
  inputs: [{ type: 'number', key: 'length', default: 10, min: 1 }],
  style: [{ type: 'color', key: 'color', default: 'rgb(126 87 194)' }]
} as const satisfies StudySchema

type MOMParams = InferStudyValues<typeof MOM_SCHEMA.inputs> & InferStudyValues<typeof MOM_SCHEMA.style>

export class Momentum extends AbstractIndicator implements Indicator {
  static readonly ikey = 'mom' as const

  #chart: IChartApi
  #params: MOMParams

  #series: {
    mom: ISeriesApi<SeriesType>
    zeroLine: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(MOM_SCHEMA.inputs, MOM_SCHEMA.style, options?.params)

    this.#series = {
      mom: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.color, priceLineVisible: false },
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
      ikey: Momentum.ikey,
      schema: MOM_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(MOM_SCHEMA.inputs, MOM_SCHEMA.style, params)
    this.#series.mom.applyOptions({ color: this.#params.color })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'MOM', paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series.mom)
    const value = data ? formatPrice((data as LineData<Time>).value) : '∅'
    legend.data.push({ value, color: this.#params.color })
    return legend
  }

  protected onData(data: ChartBar[]) {
    const momData = this.#calculate(data)
    const firstTime = data[0].time
    const lastTime = data[data.length - 1].time

    this.#series.zeroLine.setData([
      { time: firstTime, value: 0 },
      { time: lastTime, value: 0 }
    ])
    this.#series.mom.setData(momData)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.mom)
    this.#chart.removeSeries(this.#series.zeroLine)
  }

  #calculate(bars: ChartBar[]) {
    const { length } = this.#params
    const mapped = bars.map((b, i) => ({
      time: b.time,
      value: i < length ? NaN : b.close - bars[i - length].close
    }))

    return this.filter(mapped)
  }
}

import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { LineSeries } from 'lightweight-charts'
import { BollingerBandsFill } from '@engine/indicators/BollingerBands/BollingerBandsFill'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import { getSourceSeries, ta } from 'oakscriptjs'

const BB_SCHEMA = {
  inputs: [
    { type: 'number', key: 'length', default: 20, min: 1 },
    { type: 'number', key: 'mul', default: 2, min: 1, step: 1 }
  ],
  style: [
    { type: 'color', key: 'upper', default: 'rgb(41 98 255)' },
    { type: 'color', key: 'middle', default: 'rgb(255 171 64)' },
    { type: 'color', key: 'lower', default: 'rgb(41 98 255)' },
    { type: 'color', key: 'fill', default: 'rgb(41 98 255 / 10%)' }
  ]
} as const satisfies StudySchema

export type BBParams = InferStudyValues<typeof BB_SCHEMA.inputs> & InferStudyValues<typeof BB_SCHEMA.style>

export class BollingerBands extends AbstractIndicator implements Indicator {
  static readonly ikey = 'bb' as const

  #chart: IChartApi
  #params: BBParams = resolveStudyParams(BB_SCHEMA.inputs, BB_SCHEMA.style)
  #fill = new BollingerBandsFill(this.#params)

  #series: {
    upper: ISeriesApi<SeriesType>
    middle: ISeriesApi<SeriesType>
    lower: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(BB_SCHEMA.inputs, BB_SCHEMA.style, options.params)

    this.#series = {
      upper: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.upper, priceLineVisible: false },
        this.paneIndex
      ),
      middle: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.middle, priceLineVisible: false },
        this.paneIndex
      ),
      lower: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.lower, priceLineVisible: false },
        this.paneIndex
      )
    }

    this.#series.upper.attachPrimitive(this.#fill)
  }

  getSchema() {
    return {
      ikey: BollingerBands.ikey,
      schema: BB_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(BB_SCHEMA.inputs, BB_SCHEMA.style, params)

    this.#series.upper.applyOptions({ color: this.#params.upper })
    this.#series.middle.applyOptions({ color: this.#params.middle })
    this.#series.lower.applyOptions({ color: this.#params.lower })
    this.#fill.setParams(this.#params)
  }

  getLegend(seriesData: SeriesMap) {
    const uData = seriesData.get(this.#series.upper)
    const mData = seriesData.get(this.#series.middle)
    const lData = seriesData.get(this.#series.lower)

    if (uData && mData && lData) {
      return {
        key: BollingerBands.ikey.toUpperCase(),
        paneIndex: this.paneIndex,
        data: [
          {
            value: formatPrice((mData as LineData<Time>).value),
            color: this.#params.middle
          },
          {
            value: formatPrice((uData as LineData<Time>).value),
            color: this.#params.lower
          },
          {
            value: formatPrice((lData as LineData<Time>).value),
            color: this.#params.upper
          }
        ]
      }
    }

    return undefined
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
    const basis = ta.sma(source, this.#params.length)
    const dev = ta.stdev(source, this.#params.length).mul(this.#params.mul)
    const upper = basis.add(dev)
    const lower = basis.sub(dev)

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

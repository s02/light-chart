import { LineSeries } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { ZigZagPrimitive } from './ZigZagPrimitive'
import type { ZigZagLine } from './ZigZagRenderer'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import { calculateZigZag } from 'oakscriptjs'

const ZZ_SCHEMA = {
  inputs: [
    { type: 'number', key: 'deviation', default: 0.001, min: 0 },
    { type: 'number', key: 'depth', default: 10, min: 1 }
  ],
  style: [{ type: 'color', key: 'color', default: 'rgb(255 171 64)' }]
} as const satisfies StudySchema

type ZZParams = InferStudyValues<typeof ZZ_SCHEMA.inputs> & InferStudyValues<typeof ZZ_SCHEMA.style>

export class ZigZag extends AbstractIndicator implements Indicator {
  static readonly ikey = 'zigzag' as const

  #chart: IChartApi
  #params: ZZParams
  #series: ISeriesApi<SeriesType>
  #primitive: ZigZagPrimitive

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(ZZ_SCHEMA.inputs, ZZ_SCHEMA.style, options?.params)
    this.#primitive = new ZigZagPrimitive(this.#params.color)

    this.#series = this.#chart.addSeries(
      LineSeries,
      {
        ...COMMON_SERIES_SETTINGS,
        lineVisible: false,
        crosshairMarkerVisible: false,
        lastValueVisible: false,
        priceLineVisible: false
      },
      this.paneIndex
    )

    this.#series.attachPrimitive(this.#primitive)
  }

  getSchema() {
    return {
      ikey: ZigZag.ikey,
      schema: ZZ_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(ZZ_SCHEMA.inputs, ZZ_SCHEMA.style, params)
    this.#primitive.setColor(this.#params.color)
  }

  getLegend(seriesData: SeriesMap) {
    const data = seriesData.get(this.#series) as LineData<Time> | undefined

    if (data) {
      return {
        key: ZigZag.ikey.toUpperCase(),
        paneIndex: this.paneIndex,
        data: [{ value: formatPrice(data.value), color: this.#params.color }]
      }
    }

    return
  }

  protected onData(data: ChartBar[]) {
    const { seriesData, lines } = this.#calculate(data)
    this.#series.setData(seriesData)
    this.#primitive.setLines(lines)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series)
  }

  #calculate(bars: ChartBar[]) {
    const result = calculateZigZag(bars, {
      devThreshold: this.#params.deviation,
      depth: this.#params.depth,
      extendLast: false
    })

    const allPivots = result.pivots
    const seriesData: LineData<Time>[] = []
    const lines: ZigZagLine[] = []

    for (const pivot of allPivots) {
      seriesData.push({ time: bars[pivot.end.barIndex].time, value: pivot.end.price })
    }

    for (let i = 1; i < allPivots.length; i++) {
      const prev = allPivots[i - 1]
      const curr = allPivots[i]
      lines.push({
        from: { time: bars[prev.end.barIndex].time, price: prev.end.price },
        to: { time: bars[curr.end.barIndex].time, price: curr.end.price }
      })
    }

    return { seriesData, lines }
  }
}

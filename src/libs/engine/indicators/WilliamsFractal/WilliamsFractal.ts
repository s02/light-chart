import { LineSeries, createSeriesMarkers } from 'lightweight-charts'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, ISeriesMarkersPluginApi, SeriesMarker, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'
import { formatPrice } from '@engine/helpers'

const WF_SCHEMA = {
  inputs: [{ type: 'number', key: 'periods', default: 2, min: 2 }],
  style: [
    { type: 'color', key: 'bear', default: 'rgb(239 83 80)' },
    { type: 'color', key: 'bull', default: 'rgb(38 166 154)' }
  ]
} as const satisfies StudySchema

type WFParams = InferStudyValues<typeof WF_SCHEMA.inputs> & InferStudyValues<typeof WF_SCHEMA.style>

export class WilliamsFractal extends AbstractIndicator implements Indicator {
  static readonly ikey = 'fractal' as const

  #chart: IChartApi
  #params: WFParams
  #series: ISeriesApi<SeriesType>
  #markers: ISeriesMarkersPluginApi<Time>

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(WF_SCHEMA.inputs, WF_SCHEMA.style, options?.params)

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

    this.#markers = createSeriesMarkers(this.#series)
  }

  getSchema() {
    return {
      ikey: WilliamsFractal.ikey,
      schema: WF_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(WF_SCHEMA.inputs, WF_SCHEMA.style, params)
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'Fractals', paneIndex: this.paneIndex, data: [] }
    const data = seriesData.get(this.#series)
    if (data) {
      const t = data.time
      const markers = this.#markers.markers()
      const hasBear = markers.some((m) => m.time === t && m.position === 'atPriceTop')
      const hasBull = markers.some((m) => m.time === t && m.position === 'atPriceBottom')
      legend.data.push(
        { value: hasBear ? formatPrice(1) : formatPrice(0), color: this.#params.bull },
        { value: hasBull ? formatPrice(1) : formatPrice(0), color: this.#params.bear }
      )
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    this.#series.setData(data.map((d) => ({ ...d, value: d.close })))
    this.#markers.setMarkers(this.#calculate(data))
  }

  protected removeSeries() {
    this.#markers.detach()
    this.#chart.removeSeries(this.#series)
  }

  #checkLeft(bars: ChartBar[], c: number, ties: number, field: 'high' | 'low') {
    const base = bars[c][field]
    const n = this.#params.periods

    for (let k = 1; k <= ties; k++) {
      if (c - k < 0) return false
      const v = bars[c - k][field]
      if (field === 'high' ? v > base : v < base) return false
    }

    for (let i = 1; i <= n; i++) {
      const idx = c - ties - i
      if (idx < 0) return false
      const v = bars[idx][field]
      if (field === 'high' ? v >= base : v <= base) return false
    }

    return true
  }

  #calculate(bars: ChartBar[]) {
    const n = this.#params.periods
    const markers: SeriesMarker<Time>[] = []

    for (let t = n; t < bars.length; t++) {
      const c = t - n

      let rightHigh = true
      let rightLow = true

      for (let i = 1; i <= n; i++) {
        const ri = c + i
        if (ri >= bars.length || bars[ri].high >= bars[c].high) rightHigh = false
        if (ri >= bars.length || bars[ri].low <= bars[c].low) rightLow = false
      }

      if (rightHigh) {
        const isFractal =
          this.#checkLeft(bars, c, 0, 'high') ||
          this.#checkLeft(bars, c, 1, 'high') ||
          this.#checkLeft(bars, c, 2, 'high') ||
          this.#checkLeft(bars, c, 3, 'high') ||
          this.#checkLeft(bars, c, 4, 'high')

        if (isFractal) {
          markers.push({
            time: bars[c].time,
            position: 'atPriceTop',
            shape: 'arrowUp',
            color: this.#params.bull,
            price: bars[c].high,
            size: 0.5
          })
        }
      }

      if (rightLow) {
        const isFractal =
          this.#checkLeft(bars, c, 0, 'low') ||
          this.#checkLeft(bars, c, 1, 'low') ||
          this.#checkLeft(bars, c, 2, 'low') ||
          this.#checkLeft(bars, c, 3, 'low') ||
          this.#checkLeft(bars, c, 4, 'low')

        if (isFractal) {
          markers.push({
            time: bars[c].time,
            position: 'atPriceBottom',
            shape: 'arrowDown',
            color: this.#params.bear,
            price: bars[c].low,
            size: 0.5
          })
        }
      }
    }

    return markers
  }
}

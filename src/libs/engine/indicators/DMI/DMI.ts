import { LineSeries } from 'lightweight-charts'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { formatPrice } from '@engine/helpers'
import { ta } from 'oakscriptjs'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'

const DMI_SCHEMA = {
  inputs: [
    { type: 'number', key: 'diLength', default: 14, min: 1 },
    { type: 'number', key: 'adxSmoothing', default: 14, min: 1 }
  ],
  style: [
    { type: 'color', key: 'plusDIColor', default: '#2196F3' },
    { type: 'color', key: 'minusDIColor', default: '#FF6D00' },
    { type: 'color', key: 'dxColor', default: '#FFA726' },
    { type: 'color', key: 'adxColor', default: '#F50057' },
    { type: 'color', key: 'adxrColor', default: '#ab47bc' }
  ]
} as const satisfies StudySchema

type DMIParams = InferStudyValues<typeof DMI_SCHEMA.inputs> & InferStudyValues<typeof DMI_SCHEMA.style>

export class DMI extends AbstractIndicator implements Indicator {
  static readonly ikey = 'dmi' as const

  #chart: IChartApi
  #params: DMIParams

  #series: {
    plusDI: ISeriesApi<SeriesType>
    minusDI: ISeriesApi<SeriesType>
    dx: ISeriesApi<SeriesType>
    adx: ISeriesApi<SeriesType>
    adxr: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(DMI_SCHEMA.inputs, DMI_SCHEMA.style, options?.params)

    this.#series = {
      plusDI: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.plusDIColor, priceLineVisible: false },
        this.paneIndex
      ),
      minusDI: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.minusDIColor, priceLineVisible: false },
        this.paneIndex
      ),
      dx: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.dxColor, priceLineVisible: false },
        this.paneIndex
      ),
      adx: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.adxColor, priceLineVisible: false },
        this.paneIndex
      ),
      adxr: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.adxrColor, priceLineVisible: false },
        this.paneIndex
      )
    }
  }

  getSchema() {
    return {
      ikey: DMI.ikey,
      schema: DMI_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(DMI_SCHEMA.inputs, DMI_SCHEMA.style, params)
    this.#series.plusDI.applyOptions({ color: this.#params.plusDIColor })
    this.#series.minusDI.applyOptions({ color: this.#params.minusDIColor })
    this.#series.dx.applyOptions({ color: this.#params.dxColor })
    this.#series.adx.applyOptions({ color: this.#params.adxColor })
    this.#series.adxr.applyOptions({ color: this.#params.adxrColor })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'DMI', paneIndex: this.paneIndex, data: [] }
    const entries = [
      [this.#series.plusDI, this.#params.plusDIColor],
      [this.#series.minusDI, this.#params.minusDIColor],
      [this.#series.dx, this.#params.dxColor],
      [this.#series.adx, this.#params.adxColor],
      [this.#series.adxr, this.#params.adxrColor]
    ] as const
    for (const [series, color] of entries) {
      const data = seriesData.get(series)
      const value = data ? formatPrice((data as LineData<Time>).value) : '∅'
      legend.data.push({ value, color })
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    const { plusDI, minusDI, dx, adx, adxr } = this.#calculate(data)
    this.#series.plusDI.setData(plusDI)
    this.#series.minusDI.setData(minusDI)
    this.#series.dx.setData(dx)
    this.#series.adx.setData(adx)
    this.#series.adxr.setData(adxr)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.plusDI)
    this.#chart.removeSeries(this.#series.minusDI)
    this.#chart.removeSeries(this.#series.dx)
    this.#chart.removeSeries(this.#series.adx)
    this.#chart.removeSeries(this.#series.adxr)
  }

  #calculate(bars: ChartBar[]) {
    const { diLength, adxSmoothing } = this.#params

    const [plusDISeries, minusDISeries, adxSeries] = ta.dmi(bars, diLength, adxSmoothing)
    const plusDIArr = plusDISeries.toArray()
    const minusDIArr = minusDISeries.toArray()
    const adxArr = adxSeries.toArray()

    const dxArr = plusDIArr.map((plus, i) => {
      const minus = minusDIArr[i]
      if (plus == null || minus == null || isNaN(plus) || isNaN(minus)) return NaN
      const sum = plus + minus
      return sum === 0 ? 0 : (100 * Math.abs(plus - minus)) / sum
    })

    const adxrArr = adxArr.map((v, i) => {
      if (v == null || isNaN(v)) return NaN
      const prev = adxArr[i - (diLength - 1)]
      if (prev == null || isNaN(prev)) return NaN
      return (v + prev) / 2
    })

    const toPoint = (value: number | null | undefined, i: number) => ({
      time: bars[i].time,
      value: value == null || isNaN(value) ? NaN : value
    })

    return {
      plusDI: this.filter(plusDIArr.map(toPoint)),
      minusDI: this.filter(minusDIArr.map(toPoint)),
      dx: this.filter(dxArr.map(toPoint)),
      adx: this.filter(adxArr.map(toPoint)),
      adxr: this.filter(adxrArr.map(toPoint))
    }
  }
}

import { LineSeries, createSeriesMarkers } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type {
  IChartApi,
  ISeriesApi,
  ISeriesMarkersPluginApi,
  LineData,
  SeriesMarker,
  SeriesType,
  Time
} from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'
import { getSourceSeries, ta } from 'oakscriptjs'

const MAEMA_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'maema-maLength', default: 10, min: 1, max: 2000 },
    { type: 'number', key: 'maema-emaLength', default: 10, min: 1, max: 2000 }
  ],
  style: [
    { type: 'color', key: 'maema-ma', default: 'rgb(255 109 0)' },
    { type: 'color', key: 'maema-ema', default: 'rgb(67 160 71)' },
    { type: 'color', key: 'maema-cross', default: 'rgb(33 150 243)' }
  ]
} as const satisfies StudySchema

type MAEMAParams = InferStudyValues<typeof MAEMA_SCHEMA.inputs> &
  InferStudyValues<typeof MAEMA_SCHEMA.style> &
  InferStudyValues<typeof MAEMA_SCHEMA.text>

export class MAEMACross extends AbstractIndicator implements Indicator {
  static readonly ikey = 'maema' as const

  #chart: IChartApi
  #params: MAEMAParams

  #series: {
    ma: ISeriesApi<SeriesType>
    ema: ISeriesApi<SeriesType>
  }

  #markers: ISeriesMarkersPluginApi<Time>

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(MAEMA_SCHEMA.inputs, MAEMA_SCHEMA.style, MAEMA_SCHEMA.text, options?.params)

    this.#series = {
      ma: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['maema-ma'], priceLineVisible: false },
        this.paneIndex
      ),
      ema: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['maema-ema'], priceLineVisible: false },
        this.paneIndex
      )
    }

    this.#markers = createSeriesMarkers(this.#series.ma)
  }

  getSchema() {
    return {
      ikey: MAEMACross.ikey,
      schema: MAEMA_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(MAEMA_SCHEMA.inputs, MAEMA_SCHEMA.style, MAEMA_SCHEMA.text, params)
    this.#series.ma.applyOptions({ color: this.#params['maema-ma'] })
    this.#series.ema.applyOptions({ color: this.#params['maema-ema'] })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'MA/EMA CROSS', paneIndex: this.paneIndex, data: [] }
    const maData = seriesData.get(this.#series.ma)
    const emaData = seriesData.get(this.#series.ema)
    legend.data.push(
      { value: this.#params['maema-maLength'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['maema-emaLength'].toString(), color: 'rgb(140, 140, 140)' }
    )
    if (maData && emaData) {
      legend.data.push(
        { value: formatPrice((maData as LineData<Time>).value), color: this.#params['maema-ma'] },
        { value: formatPrice((emaData as LineData<Time>).value), color: this.#params['maema-ema'] }
      )
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    const pp = this.#calculate(data)
    this.#series.ma.setData(pp.ma)
    this.#series.ema.setData(pp.ema)
    this.#markers.setMarkers(pp.markers)
  }

  protected removeSeries() {
    this.#markers.detach()
    this.#chart.removeSeries(this.#series.ma)
    this.#chart.removeSeries(this.#series.ema)
  }

  #calculate(bars: ChartBar[]) {
    const source = getSourceSeries(bars, 'close')
    const maSeries = ta.sma(source, this.#params['maema-maLength'])
    const emaSeries = ta.ema(source, this.#params['maema-emaLength'])
    const maArr = maSeries.toArray()
    const emaArr = emaSeries.toArray()
    const crossArr = ta.cross(maSeries, emaSeries).toArray()

    const toBar = (value: number, i: number) => ({
      time: bars[i].time,
      value: value ?? NaN
    })

    const markers: SeriesMarker<Time>[] = []

    for (let i = 0; i < bars.length; i++) {
      if (!crossArr[i]) continue
      const ma = maArr[i]
      if (ma == null) continue
      markers.push({
        time: bars[i].time,
        position: 'atPriceMiddle',
        shape: 'square',
        color: this.#params['maema-cross'],
        price: ma,
        size: 0.6
      })
    }

    return {
      ma: this.filter(maArr.map(toBar)),
      ema: this.filter(emaArr.map(toBar)),
      markers
    }
  }
}

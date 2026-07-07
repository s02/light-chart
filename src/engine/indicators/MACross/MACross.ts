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

const MA_CROSS_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'macross-shortLength', default: 9, min: 1, max: 9999 },
    { type: 'number', key: 'macross-longLength', default: 26, min: 1, max: 9999 }
  ],
  style: [
    { type: 'color', key: 'macross-short', default: 'rgb(255 109 0)' },
    { type: 'color', key: 'macross-long', default: 'rgb(67 160 71)' },
    { type: 'color', key: 'macross-cross', default: 'rgb(33 150 243)' }
  ]
} as const satisfies StudySchema

type MACrossParams = InferStudyValues<typeof MA_CROSS_SCHEMA.inputs> &
  InferStudyValues<typeof MA_CROSS_SCHEMA.style> &
  InferStudyValues<typeof MA_CROSS_SCHEMA.text>

export class MACross extends AbstractIndicator implements Indicator {
  static readonly ikey = 'macross' as const

  #chart: IChartApi
  #params: MACrossParams

  #series: {
    fast: ISeriesApi<SeriesType>
    slow: ISeriesApi<SeriesType>
  }

  #markers: ISeriesMarkersPluginApi<Time>

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(
      MA_CROSS_SCHEMA.inputs,
      MA_CROSS_SCHEMA.style,
      MA_CROSS_SCHEMA.text,
      options?.params
    )

    this.#series = {
      fast: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['macross-short'], priceLineVisible: false },
        this.paneIndex
      ),
      slow: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['macross-long'], priceLineVisible: false },
        this.paneIndex
      )
    }

    this.#markers = createSeriesMarkers(this.#series.fast)
  }

  getSchema() {
    return {
      ikey: MACross.ikey,
      schema: MA_CROSS_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(MA_CROSS_SCHEMA.inputs, MA_CROSS_SCHEMA.style, MA_CROSS_SCHEMA.text, params)
    this.#series.fast.applyOptions({ color: this.#params['macross-short'] })
    this.#series.slow.applyOptions({ color: this.#params['macross-long'] })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'MA CROSS', paneIndex: this.paneIndex, data: [] }
    const fastData = seriesData.get(this.#series.fast)
    const slowData = seriesData.get(this.#series.slow)
    legend.data.push(
      { value: this.#params['macross-shortLength'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['macross-longLength'].toString(), color: 'rgb(140, 140, 140)' }
    )
    if (fastData && slowData) {
      legend.data.push(
        { value: formatPrice((fastData as LineData<Time>).value), color: this.#params['macross-short'] },
        { value: formatPrice((slowData as LineData<Time>).value), color: this.#params['macross-long'] }
      )
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    const pp = this.#calculate(data)
    this.#series.fast.setData(pp.fast)
    this.#series.slow.setData(pp.slow)
    this.#markers.setMarkers(pp.markers)
  }

  protected removeSeries() {
    this.#markers.detach()
    this.#chart.removeSeries(this.#series.fast)
    this.#chart.removeSeries(this.#series.slow)
  }

  #calculate(bars: ChartBar[]) {
    const source = getSourceSeries(bars, 'close')
    const fastSeries = ta.sma(source, this.#params['macross-shortLength'])
    const slowSeries = ta.sma(source, this.#params['macross-longLength'])
    const fastArr = fastSeries.toArray()
    const slowArr = slowSeries.toArray()
    const crossArr = ta.cross(fastSeries, slowSeries).toArray()

    const toBar = (value: number, i: number) => ({
      time: bars[i].time,
      value: value ?? NaN
    })

    const markers: SeriesMarker<Time>[] = []

    for (let i = 0; i < bars.length; i++) {
      if (!crossArr[i]) continue
      const fast = fastArr[i]
      const slow = slowArr[i]
      if (fast == null || slow == null) continue
      markers.push({
        time: bars[i].time,
        position: 'atPriceMiddle',
        shape: 'square',
        color: this.#params['macross-cross'],
        price: fast,
        size: 0.6
      })
    }

    return {
      fast: this.filter(fastArr.map(toBar)),
      slow: this.filter(slowArr.map(toBar)),
      markers
    }
  }
}

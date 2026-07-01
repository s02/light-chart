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

const KST_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'kst-roc1', default: 10, min: 1, max: 9999 },
    { type: 'number', key: 'kst-roc2', default: 15, min: 1, max: 9999 },
    { type: 'number', key: 'kst-roc3', default: 20, min: 1, max: 9999 },
    { type: 'number', key: 'kst-roc4', default: 30, min: 1, max: 9999 },
    { type: 'number', key: 'kst-sma1', default: 10, min: 1, max: 9999 },
    { type: 'number', key: 'kst-sma2', default: 10, min: 1, max: 9999 },
    { type: 'number', key: 'kst-sma3', default: 10, min: 1, max: 9999 },
    { type: 'number', key: 'kst-sma4', default: 15, min: 1, max: 9999 },
    { type: 'number', key: 'kst-signal', default: 9, min: 1, max: 9999 },
    { type: 'number', key: 'kst-zero', default: 0, min: 0, max: 9999 }
  ],
  style: [
    { type: 'color', key: 'kst-kstLine', default: 'rgb(41 98 255)' },
    { type: 'color', key: 'kst-signalLine', default: 'rgb(255 109 0)' }
  ]
} as const satisfies StudySchema

type KSTParams = InferStudyValues<typeof KST_SCHEMA.inputs> &
  InferStudyValues<typeof KST_SCHEMA.style> &
  InferStudyValues<typeof KST_SCHEMA.text>

export class KnowSureThing extends AbstractIndicator implements Indicator {
  static readonly ikey = 'kst' as const

  #chart: IChartApi
  #params: KSTParams

  #series: {
    kst: ISeriesApi<SeriesType>
    signal: ISeriesApi<SeriesType>
    zero: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(KST_SCHEMA.inputs, KST_SCHEMA.style, KST_SCHEMA.text, options?.params)

    this.#series = {
      kst: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['kst-kstLine'], priceLineVisible: false },
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
      ),
      signal: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['kst-signalLine'], priceLineVisible: false },
        this.paneIndex
      )
    }
  }

  getSchema() {
    return {
      ikey: KnowSureThing.ikey,
      schema: KST_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(KST_SCHEMA.inputs, KST_SCHEMA.style, KST_SCHEMA.text, params)
    this.#series.kst.applyOptions({ color: this.#params['kst-kstLine'] })
    this.#series.signal.applyOptions({ color: this.#params['kst-signalLine'] })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'KST', paneIndex: this.paneIndex, data: [] }
    const kstData = seriesData.get(this.#series.kst)
    const signalData = seriesData.get(this.#series.signal)

    legend.data.push(
      { value: this.#params['kst-roc1'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['kst-roc2'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['kst-roc3'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['kst-roc4'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['kst-sma1'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['kst-sma2'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['kst-sma3'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['kst-sma4'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['kst-signal'].toString(), color: 'rgb(140, 140, 140)' }
    )

    if (kstData && signalData) {
      legend.data.push(
        { value: formatPrice((kstData as LineData<Time>).value), color: this.#params['kst-kstLine'] },
        { value: formatPrice((signalData as LineData<Time>).value), color: this.#params['kst-signalLine'] }
      )
    }

    return legend
  }

  protected onData(data: ChartBar[]) {
    const { kst, signal } = this.#calculate(data)

    const firstTime = data[0].time
    const lastTime = data[data.length - 1].time

    this.#series.kst.setData(kst)
    this.#series.signal.setData(signal)
    this.#series.zero.setData([
      { time: firstTime, value: this.#params['kst-zero'] },
      { time: lastTime, value: this.#params['kst-zero'] }
    ])
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.kst)
    this.#chart.removeSeries(this.#series.signal)
    this.#chart.removeSeries(this.#series.zero)
  }

  #calculate(bars: ChartBar[]) {
    const close = getSourceSeries(bars, 'close')

    const rcma1 = ta.sma(ta.roc(close, this.#params['kst-roc1']), this.#params['kst-sma1'])
    const rcma2 = ta.sma(ta.roc(close, this.#params['kst-roc2']), this.#params['kst-sma2'])
    const rcma3 = ta.sma(ta.roc(close, this.#params['kst-roc3']), this.#params['kst-sma3'])
    const rcma4 = ta.sma(ta.roc(close, this.#params['kst-roc4']), this.#params['kst-sma4'])

    const kstSeries = rcma1.mul(1).add(rcma2.mul(2)).add(rcma3.mul(3)).add(rcma4.mul(4))
    const signalSeries = ta.sma(kstSeries, this.#params['kst-signal'])

    const toBar = (value: number, i: number) => ({
      time: bars[i].time,
      value: value ?? NaN
    })

    const kst = this.filter(kstSeries.toArray().map(toBar))
    const signal = this.filter(signalSeries.toArray().map(toBar))

    return { kst, signal }
  }
}

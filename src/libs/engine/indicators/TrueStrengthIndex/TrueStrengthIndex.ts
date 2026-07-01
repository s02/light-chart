import { LineSeries, LineStyle } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { getSourceSeries, ta } from 'oakscriptjs'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'

const TSI_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'true-si-long', default: 25, min: 1 },
    { type: 'number', key: 'true-si-short', default: 13, min: 1 },
    { type: 'number', key: 'true-si-signal', default: 13, min: 1 }
  ],
  style: [
    { type: 'color', key: 'true-si-tsiLine', default: 'rgb(41 98 255)' },
    { type: 'color', key: 'true-si-signalLine', default: 'rgb(255 109 0)' }
  ]
} as const satisfies StudySchema

type TSIParams = InferStudyValues<typeof TSI_SCHEMA.inputs> &
  InferStudyValues<typeof TSI_SCHEMA.style> &
  InferStudyValues<typeof TSI_SCHEMA.text>

export class TrueStrengthIndex extends AbstractIndicator implements Indicator {
  static readonly ikey = 'true-si' as const

  #chart: IChartApi
  #params: TSIParams

  #series: {
    tsi: ISeriesApi<SeriesType>
    signal: ISeriesApi<SeriesType>
    zeroLine: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(TSI_SCHEMA.inputs, TSI_SCHEMA.style, TSI_SCHEMA.text, options?.params)

    this.#series = {
      tsi: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['true-si-tsiLine'], priceLineVisible: false },
        this.paneIndex
      ),
      signal: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['true-si-signalLine'], priceLineVisible: false },
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
      ikey: TrueStrengthIndex.ikey,
      schema: TSI_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(TSI_SCHEMA.inputs, TSI_SCHEMA.style, TSI_SCHEMA.text, params)
    this.#series.tsi.applyOptions({ color: this.#params['true-si-tsiLine'] })
    this.#series.signal.applyOptions({ color: this.#params['true-si-signalLine'] })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'True Strength Index', paneIndex: this.paneIndex, data: [] }
    legend.data.push(
      { value: this.#params['true-si-long'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['true-si-short'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['true-si-signal'].toString(), color: 'rgb(140, 140, 140)' }
    )
    const entries = [
      [this.#series.tsi, this.#params['true-si-tsiLine']],
      [this.#series.signal, this.#params['true-si-signalLine']]
    ] as const
    for (const [series, color] of entries) {
      const data = seriesData.get(series)
      if (data) legend.data.push({ value: formatPrice((data as LineData<Time>).value), color })
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    const { tsiData, signalData } = this.#calculate(data)
    const firstTime = data[0].time
    const lastTime = data[data.length - 1].time

    this.#series.zeroLine.setData([
      { time: firstTime, value: 0 },
      { time: lastTime, value: 0 }
    ])
    this.#series.tsi.setData(tsiData)
    this.#series.signal.setData(signalData)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.tsi)
    this.#chart.removeSeries(this.#series.signal)
    this.#chart.removeSeries(this.#series.zeroLine)
  }

  #calculate(bars: ChartBar[]) {
    const close = getSourceSeries(bars, 'close')
    const tsiSeries = ta.tsi(close, this.#params['true-si-short'], this.#params['true-si-long'])
    const signalSeries = ta.ema(tsiSeries, this.#params['true-si-signal'])

    const tsiArr = tsiSeries.toArray()
    const signalArr = signalSeries.toArray()

    const toBar = (value: number, i: number) => ({ time: bars[i].time, value: value ?? NaN })

    return {
      tsiData: this.filter(tsiArr.map(toBar)),
      signalData: this.filter(signalArr.map(toBar))
    }
  }
}

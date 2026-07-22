import { HistogramSeries, LineSeries, LineStyle, LineType } from 'lightweight-charts'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { formatPrice } from '@engine/helpers'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, HistogramData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'
import { getSourceSeries, ta } from 'oakscriptjs'

const MACD_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'macd-fast', default: 12, min: 1, max: 9999 },
    { type: 'number', key: 'macd-slow', default: 26, min: 1, max: 9999 },
    {
      type: 'select',
      key: 'macd-source',
      values: ['close', 'open', 'high', 'low'],
      default: 'close'
    },
    { type: 'number', key: 'macd-signal', default: 9, min: 1, max: 9999 },
    {
      type: 'select',
      key: 'macd-oscMaType',
      values: ['SMA', 'EMA', 'WMA'],
      default: 'EMA'
    },
    {
      type: 'select',
      key: 'macd-signalMaType',
      values: ['SMA', 'EMA', 'WMA'],
      default: 'EMA'
    }
  ],
  style: [
    {
      type: 'line',
      key: 'macd-macdLine',
      default: {
        color: 'rgb(33 150 243)',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        lineType: LineType.Simple
      }
    },
    {
      type: 'line',
      key: 'macd-signalLine',
      default: {
        color: 'rgb(255 109 0)',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        lineType: LineType.Simple
      }
    },
    { type: 'color', key: 'macd-hist-0', default: 'rgb(34, 171, 148)' },
    { type: 'color', key: 'macd-hist-1', default: 'rgb(172, 229, 220)' },
    { type: 'color', key: 'macd-hist-2', default: 'rgb(252, 203, 205)' },
    { type: 'color', key: 'macd-hist-3', default: 'rgb(255, 82, 82)' }
  ]
} as const satisfies StudySchema

type MACDParams = InferStudyValues<typeof MACD_SCHEMA.inputs> &
  InferStudyValues<typeof MACD_SCHEMA.style> &
  InferStudyValues<typeof MACD_SCHEMA.text>

export class MACD extends AbstractIndicator implements Indicator {
  static readonly ikey = 'macd' as const

  #chart: IChartApi
  #params: MACDParams

  #series: {
    macd: ISeriesApi<SeriesType>
    signal: ISeriesApi<SeriesType>
    hist: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(MACD_SCHEMA.inputs, MACD_SCHEMA.style, MACD_SCHEMA.text, options?.params)

    this.#series = {
      hist: this.#chart.addSeries(
        HistogramSeries,
        { ...COMMON_SERIES_SETTINGS, color: this.#params['macd-hist-0'], priceLineVisible: false },
        this.paneIndex
      ),
      macd: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, ...this.#params['macd-macdLine'], priceLineVisible: false },
        this.paneIndex
      ),
      signal: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, ...this.#params['macd-signalLine'], priceLineVisible: false },
        this.paneIndex
      )
    }
  }

  getSchema() {
    return {
      ikey: MACD.ikey,
      schema: MACD_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(MACD_SCHEMA.inputs, MACD_SCHEMA.style, MACD_SCHEMA.text, params)
    this.#series.macd.applyOptions(this.#params['macd-macdLine'])
    this.#series.signal.applyOptions(this.#params['macd-signalLine'])
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: MACD.ikey.toUpperCase(), paneIndex: this.paneIndex, data: [] }
    const macdData = seriesData.get(this.#series.macd)
    const signalData = seriesData.get(this.#series.signal)
    const histData = seriesData.get(this.#series.hist)
    legend.data.push(
      { value: this.#params['macd-fast'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['macd-slow'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['macd-signal'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['macd-oscMaType'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['macd-signalMaType'].toString(), color: 'rgb(140, 140, 140)' }
    )
    if (macdData && signalData && histData) {
      const histValue = (histData as HistogramData<Time>).value
      legend.data.push(
        {
          value: formatPrice(histValue),
          color: histValue >= 0 ? this.#params['macd-hist-0'] : this.#params['macd-hist-3']
        },
        { value: formatPrice((macdData as LineData<Time>).value), color: this.#params['macd-macdLine'].color },
        { value: formatPrice((signalData as LineData<Time>).value), color: this.#params['macd-signalLine'].color }
      )
    }

    return legend
  }

  protected onData(data: ChartBar[]) {
    const pp = this.#calculate(data)
    this.#series.macd.setData(pp.macd)
    this.#series.signal.setData(pp.signal)
    this.#series.hist.setData(pp.hist)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.macd)
    this.#chart.removeSeries(this.#series.signal)
    this.#chart.removeSeries(this.#series.hist)
  }

  #ma(source: ReturnType<typeof getSourceSeries>, length: number, type: MACDParams['macd-oscMaType']) {
    if (type === 'SMA') {
      return ta.sma(source, length)
    }
    if (type === 'WMA') {
      return ta.wma(source, length)
    }
    return ta.ema(source, length)
  }

  #calculate(bars: ChartBar[]) {
    const source = getSourceSeries(bars, this.#params['macd-source'])

    const fastMA = this.#ma(source, this.#params['macd-fast'], this.#params['macd-oscMaType'])
    const slowMA = this.#ma(source, this.#params['macd-slow'], this.#params['macd-oscMaType'])
    const macdLine = fastMA.sub(slowMA)
    const signalLine = this.#ma(macdLine, this.#params['macd-signal'], this.#params['macd-signalMaType'])
    const histogram = macdLine.sub(signalLine)

    const histArr = histogram.toArray()
    const hist = histArr.map((value, i) => {
      const time = bars[i].time

      if (!value) {
        return {
          time
        }
      }

      const prev = i > 0 ? (histArr[i - 1] ?? NaN) : NaN
      let color: string
      if (value >= 0) {
        color = prev < value ? this.#params['macd-hist-0'] : this.#params['macd-hist-1']
      } else {
        color = prev < value ? this.#params['macd-hist-2'] : this.#params['macd-hist-3']
      }

      return { time, value, color }
    })

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

    const macd = macdLine.toArray().map(toBar)
    const signal = signalLine.toArray().map(toBar)

    return {
      macd,
      signal,
      hist
    }
  }
}

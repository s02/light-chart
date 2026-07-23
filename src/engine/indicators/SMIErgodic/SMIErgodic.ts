import { HistogramSeries, LineSeries, LineStyle, LineType } from 'lightweight-charts'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { formatPrice } from '@engine/helpers'
import { getSourceSeries, ta } from 'oakscriptjs'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, HistogramData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'

const SMI_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'smiio-fast', default: 5, min: 1, max: 9999 },
    { type: 'number', key: 'smiio-slow', default: 20, min: 1, max: 9999 },
    { type: 'number', key: 'smiio-signal', default: 5, min: 1, max: 9999 }
  ],
  style: [
    {
      type: 'line',
      key: 'smiio-ergodicLine',
      default: {
        color: 'rgb(33 150 243)',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        lineType: LineType.Simple
      }
    },
    {
      type: 'line',
      key: 'smiio-signalLine',
      default: {
        color: 'rgb(255 109 0)',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        lineType: LineType.Simple
      }
    },
    { type: 'color', key: 'smiio-hist', default: 'rgb(255 82 82)' }
  ]
} as const satisfies StudySchema

type SMIParams = InferStudyValues<typeof SMI_SCHEMA.inputs> &
  InferStudyValues<typeof SMI_SCHEMA.style> &
  InferStudyValues<typeof SMI_SCHEMA.text>

export class SMIErgodic extends AbstractIndicator implements Indicator {
  static readonly ikey = 'smiio' as const

  #chart: IChartApi
  #params: SMIParams

  #series: {
    hist: ISeriesApi<SeriesType>
    ergodic: ISeriesApi<SeriesType>
    signal: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(SMI_SCHEMA.inputs, SMI_SCHEMA.style, SMI_SCHEMA.text, options?.params)

    this.#series = {
      hist: this.#chart.addSeries(
        HistogramSeries,
        { ...COMMON_SERIES_SETTINGS, color: this.#params['smiio-hist'], priceLineVisible: false },
        this.paneIndex
      ),
      ergodic: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, ...this.#params['smiio-ergodicLine'], priceLineVisible: false },
        this.paneIndex
      ),
      signal: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, ...this.#params['smiio-signalLine'], priceLineVisible: false },
        this.paneIndex
      )
    }
  }

  getSchema() {
    return {
      ikey: SMIErgodic.ikey,
      schema: SMI_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(SMI_SCHEMA.inputs, SMI_SCHEMA.style, SMI_SCHEMA.text, params)
    this.#series.ergodic.applyOptions(this.#params['smiio-ergodicLine'])
    this.#series.signal.applyOptions(this.#params['smiio-signalLine'])
    this.#series.hist.applyOptions({ color: this.#params['smiio-hist'] })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: SMIErgodic.ikey.toUpperCase(), paneIndex: this.paneIndex, data: [] }
    const histData = seriesData.get(this.#series.hist)
    const ergodicData = seriesData.get(this.#series.ergodic)
    const signalData = seriesData.get(this.#series.signal)
    legend.data.push(
      { value: this.#params['smiio-fast'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['smiio-slow'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['smiio-signal'].toString(), color: 'rgb(140, 140, 140)' }
    )
    if (histData && ergodicData && signalData) {
      const histValue = (histData as HistogramData<Time>).value
      legend.data.push(
        { value: formatPrice((ergodicData as LineData<Time>).value), color: this.#params['smiio-ergodicLine'].color },
        { value: formatPrice((signalData as LineData<Time>).value), color: this.#params['smiio-signalLine'].color },
        { value: formatPrice(histValue), color: this.#params['smiio-hist'] }
      )
    }
    return legend
  }

  protected onData(data: ChartBar[]) {
    const pp = this.#calculate(data)
    this.#series.hist.setData(pp.hist)
    this.#series.ergodic.setData(pp.ergodic)
    this.#series.signal.setData(pp.signal)
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.hist)
    this.#chart.removeSeries(this.#series.ergodic)
    this.#chart.removeSeries(this.#series.signal)
  }

  #calculate(bars: ChartBar[]) {
    const close = getSourceSeries(bars, 'close')
    const ergodic = ta.tsi(close, this.#params['smiio-fast'], this.#params['smiio-slow']).div(100)
    const signal = ta.ema(ergodic, this.#params['smiio-signal'])
    const histogram = ergodic.sub(signal)

    const hist = histogram.toArray().map((value, i) => {
      const time = bars[i].time
      if (value == null || isNaN(value)) return { time }
      return { time, value }
    })

    const toBar = (value: number, i: number) => {
      const time = bars[i].time
      return value != null && !isNaN(value) ? { time, value } : { time }
    }

    return {
      hist,
      ergodic: ergodic.toArray().map(toBar),
      signal: signal.toArray().map(toBar)
    }
  }
}

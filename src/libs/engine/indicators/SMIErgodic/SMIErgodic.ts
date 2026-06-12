import { HistogramSeries, LineSeries } from 'lightweight-charts'
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
  inputs: [
    { type: 'number', key: 'fast', default: 5, min: 1 },
    { type: 'number', key: 'slow', default: 20, min: 1 },
    { type: 'number', key: 'signal', default: 5, min: 1 }
  ],
  style: [
    { type: 'color', key: 'ergodicLine', default: 'rgb(41 98 255)' },
    { type: 'color', key: 'signalLine', default: 'rgb(255 109 0)' },
    { type: 'color', key: 'hist', default: 'rgb(255 82 82)' }
  ]
} as const satisfies StudySchema

type SMIParams = InferStudyValues<typeof SMI_SCHEMA.inputs> & InferStudyValues<typeof SMI_SCHEMA.style>

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
    this.#params = resolveStudyParams(SMI_SCHEMA.inputs, SMI_SCHEMA.style, options?.params)

    this.#series = {
      hist: this.#chart.addSeries(
        HistogramSeries,
        { ...COMMON_SERIES_SETTINGS, color: this.#params.hist, priceLineVisible: false },
        this.paneIndex
      ),
      ergodic: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.ergodicLine, priceLineVisible: false },
        this.paneIndex
      ),
      signal: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.signalLine, priceLineVisible: false },
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
    this.#params = resolveStudyParams(SMI_SCHEMA.inputs, SMI_SCHEMA.style, params)
    this.#series.ergodic.applyOptions({ color: this.#params.ergodicLine })
    this.#series.signal.applyOptions({ color: this.#params.signalLine })
    this.#series.hist.applyOptions({ color: this.#params.hist })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: SMIErgodic.ikey.toUpperCase(), paneIndex: this.paneIndex, data: [] }
    const histData = seriesData.get(this.#series.hist)
    const ergodicData = seriesData.get(this.#series.ergodic)
    const signalData = seriesData.get(this.#series.signal)
    if (histData && ergodicData && signalData) {
      const histValue = (histData as HistogramData<Time>).value
      legend.data.push(
        { value: formatPrice((ergodicData as LineData<Time>).value), color: this.#params.ergodicLine },
        { value: formatPrice((signalData as LineData<Time>).value), color: this.#params.signalLine },
        { value: formatPrice(histValue), color: this.#params.hist }
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
    const ergodic = ta.tsi(close, this.#params.fast, this.#params.slow).div(100)
    const signal = ta.ema(ergodic, this.#params.signal)
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

import { HistogramSeries, LineSeries } from 'lightweight-charts'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { formatPrice } from '@engine/helpers'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type {
  IChartApi,
  ISeriesApi,
  LineData,
  HistogramData,
  SeriesType,
  Time,
  WhitespaceData
} from 'lightweight-charts'
import type { Indicator, IndicatorName, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed, DatafeedResult } from '@engine/types'

class EmaState {
  #length: number
  #k: number
  #buffer: number[] = []
  #value: number | null = null

  constructor(length: number) {
    this.#length = length
    this.#k = 2 / (length + 1)
  }

  update(price: number): number | null {
    if (this.#value === null) {
      this.#buffer.push(price)
      if (this.#buffer.length === this.#length) {
        this.#value = this.#buffer.reduce((a, b) => a + b, 0) / this.#buffer.length
      }
      return this.#value
    }
    this.#value = price * this.#k + this.#value * (1 - this.#k)
    return this.#value
  }

  reset(length: number) {
    this.#length = length
    this.#k = 2 / (length + 1)
    this.#buffer = []
    this.#value = null
  }
}

const MACD_SCHEMA = {
  inputs: [
    { type: 'number', key: 'fast', default: 12, min: 1 },
    { type: 'number', key: 'slow', default: 26, min: 1 },
    { type: 'number', key: 'signal', default: 9, min: 1 }
  ],
  style: [
    { type: 'color', key: 'macdLine', default: '#2962FF' },
    { type: 'color', key: 'signalLine', default: '#FF6D00' },
    { type: 'color', key: 'histUp', default: '#26A69A' },
    { type: 'color', key: 'histDown', default: '#EF5350' }
  ]
} as const satisfies StudySchema

type MACDParams = InferStudyValues<typeof MACD_SCHEMA.inputs> & InferStudyValues<typeof MACD_SCHEMA.style>

export class MACD extends AbstractIndicator implements Indicator {
  static readonly ikey: IndicatorName = 'macd'

  #chart: IChartApi
  #params: MACDParams
  #fastEma: EmaState
  #slowEma: EmaState
  #signalEma: EmaState

  #series: {
    macd: ISeriesApi<SeriesType>
    signal: ISeriesApi<SeriesType>
    hist: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(MACD_SCHEMA.inputs, MACD_SCHEMA.style, options?.params)

    this.#fastEma = new EmaState(this.#params.fast)
    this.#slowEma = new EmaState(this.#params.slow)
    this.#signalEma = new EmaState(this.#params.signal)

    this.#series = {
      macd: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.macdLine },
        this.paneIndex
      ),
      signal: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.signalLine },
        this.paneIndex
      ),
      hist: this.#chart.addSeries(
        HistogramSeries,
        { ...COMMON_SERIES_SETTINGS, color: this.#params.histUp },
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
    this.#params = resolveStudyParams(MACD_SCHEMA.inputs, MACD_SCHEMA.style, params)
    this.#series.macd.applyOptions({ color: this.#params.macdLine })
    this.#series.signal.applyOptions({ color: this.#params.signalLine })
    this.#fastEma.reset(this.#params.fast)
    this.#slowEma.reset(this.#params.slow)
    this.#signalEma.reset(this.#params.signal)
    this.reload()
  }

  getLegend(seriesData: SeriesMap) {
    const macdData = seriesData.get(this.#series.macd)
    const signalData = seriesData.get(this.#series.signal)
    const histData = seriesData.get(this.#series.hist)

    if (macdData && signalData && histData) {
      const histValue = (histData as HistogramData<Time>).value
      return {
        key: MACD.ikey.toUpperCase(),
        paneIndex: this.paneIndex,
        data: [
          { value: formatPrice((macdData as LineData<Time>).value), color: this.#params.macdLine },
          { value: formatPrice((signalData as LineData<Time>).value), color: this.#params.signalLine },
          { value: formatPrice(histValue), color: histValue >= 0 ? this.#params.histUp : this.#params.histDown }
        ]
      }
    }

    return undefined
  }

  protected onData(ev: DatafeedResult) {
    if (ev.type === 'set') {
      this.#fastEma.reset(this.#params.fast)
      this.#slowEma.reset(this.#params.slow)
      this.#signalEma.reset(this.#params.signal)

      const macdData: (LineData | WhitespaceData)[] = []
      const signalData: (LineData | WhitespaceData)[] = []
      const histData: (HistogramData | WhitespaceData)[] = []

      for (const bar of ev.data) {
        const point = this.#computeBar(bar)

        if (point.macd !== null && point.signal !== null) {
          macdData.push({ time: bar.time, value: point.macd })
          signalData.push({ time: bar.time, value: point.signal })
          histData.push({
            time: bar.time,
            value: point.hist,
            color: point.hist >= 0 ? this.#params.histUp : this.#params.histDown
          })
        } else if (point.macd !== null) {
          macdData.push({ time: bar.time, value: point.macd })
          signalData.push({ time: bar.time })
          histData.push({ time: bar.time })
        } else {
          macdData.push({ time: bar.time })
          signalData.push({ time: bar.time })
          histData.push({ time: bar.time })
        }
      }

      this.#series.macd.setData(macdData)
      this.#series.signal.setData(signalData)
      this.#series.hist.setData(histData)
    } else {
      for (const bar of ev.data) {
        const point = this.#computeBar(bar)

        if (point.macd !== null) {
          this.#series.macd.update({ time: bar.time, value: point.macd })
        }
        if (point.signal !== null) {
          this.#series.signal.update({ time: bar.time, value: point.signal })
          this.#series.hist.update({
            time: bar.time,
            value: point.hist,
            color: point.hist >= 0 ? this.#params.histUp : this.#params.histDown
          })
        }
      }
    }
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.macd)
    this.#chart.removeSeries(this.#series.signal)
    this.#chart.removeSeries(this.#series.hist)
  }

  #computeBar(bar: ChartBar) {
    const fast = this.#fastEma.update(bar.close)
    const slow = this.#slowEma.update(bar.close)

    if (fast === null || slow === null) {
      return { macd: null, signal: null, hist: 0 }
    }

    const macd = fast - slow
    const signal = this.#signalEma.update(macd)

    if (signal === null) {
      return { macd, signal: null, hist: 0 }
    }

    return { macd, signal, hist: macd - signal }
  }
}

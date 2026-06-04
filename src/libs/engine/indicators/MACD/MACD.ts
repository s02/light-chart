import { HistogramSeries, LineSeries } from 'lightweight-charts'
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
  inputs: [
    { type: 'number', key: 'fast', default: 12, min: 1 },
    { type: 'number', key: 'slow', default: 26, min: 1 },
    { type: 'number', key: 'signal', default: 9, min: 1 }
  ],
  style: [
    { type: 'color', key: 'macdLine', default: 'rgb(41 98 255)' },
    { type: 'color', key: 'signalLine', default: 'rgb(255 109 0)' },
    { type: 'color', key: 'histUp', default: 'rgb(38 166 154)' },
    { type: 'color', key: 'histDown', default: 'rgb(239 83 80)' }
  ]
} as const satisfies StudySchema

type MACDParams = InferStudyValues<typeof MACD_SCHEMA.inputs> & InferStudyValues<typeof MACD_SCHEMA.style>

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
    this.#params = resolveStudyParams(MACD_SCHEMA.inputs, MACD_SCHEMA.style, options?.params)

    this.#series = {
      hist: this.#chart.addSeries(
        HistogramSeries,
        { ...COMMON_SERIES_SETTINGS, color: this.#params.histUp, priceLineVisible: false },
        this.paneIndex
      ),
      macd: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.macdLine, priceLineVisible: false },
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
      ikey: MACD.ikey,
      schema: MACD_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(MACD_SCHEMA.inputs, MACD_SCHEMA.style, params)
    this.#series.macd.applyOptions({ color: this.#params.macdLine })
    this.#series.signal.applyOptions({ color: this.#params.signalLine })
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: MACD.ikey.toUpperCase(), paneIndex: this.paneIndex, data: [] }
    const macdData = seriesData.get(this.#series.macd)
    const signalData = seriesData.get(this.#series.signal)
    const histData = seriesData.get(this.#series.hist)
    if (macdData && signalData && histData) {
      const histValue = (histData as HistogramData<Time>).value
      legend.data.push(
        { value: formatPrice(histValue), color: histValue >= 0 ? this.#params.histUp : this.#params.histDown },
        { value: formatPrice((macdData as LineData<Time>).value), color: this.#params.macdLine },
        { value: formatPrice((signalData as LineData<Time>).value), color: this.#params.signalLine }
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

  #calculate(bars: ChartBar[]) {
    const source = getSourceSeries(bars, 'close')

    const fastEMA = ta.ema(source, this.#params.fast)
    const slowEMA = ta.ema(source, this.#params.slow)
    const macdLine = fastEMA.sub(slowEMA)
    const signalLine = ta.ema(macdLine, this.#params.signal)
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
        color = prev < value ? '#26A69A' : '#B2DFDB'
      } else {
        color = prev < value ? '#FFCDD2' : '#FF5252'
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

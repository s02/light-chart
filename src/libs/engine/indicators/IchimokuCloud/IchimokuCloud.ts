import { LineSeries } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'
import { COMMON_SERIES_SETTINGS } from '@engine/series/constants'
import { resolveStudyParams } from '@engine/schema'
import { AbstractIndicator } from '@engine/indicators/AbstractIndicator'
import { IchimokuCloudFill } from '@engine/indicators/IchimokuCloud/IchimokuCloudFill'
import type { StudySchema, InferStudyValues, StudyParams } from '@engine/schema'
import type { IChartApi, ISeriesApi, LineData, SeriesType, Time } from 'lightweight-charts'
import type { Indicator, IndicatorOptions, SeriesMap } from '@engine/indicators/types'
import type { ChartBar, Datafeed } from '@engine/types'
import type { SeriesLegend } from '@engine/series'
import { ta } from 'oakscriptjs'

const ICHIMOKU_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'ichimoku-conversionPeriods', default: 9, min: 1, max: 9999 },
    { type: 'number', key: 'ichimoku-basePeriods', default: 26, min: 1, max: 9999 },
    { type: 'number', key: 'ichimoku-leadingSpanPeriods', default: 52, min: 1, max: 9999 },
    { type: 'number', key: 'ichimoku-laggingSpanPeriods', default: 26, min: 1, max: 9999 },
    { type: 'number', key: 'ichimoku-leadingShiftPeriods', default: 26, min: 1, max: 9999 }
  ],
  style: [
    { type: 'color', key: 'ichimoku-tenkan', default: 'rgb(33 150 243)' },
    { type: 'color', key: 'ichimoku-kijun', default: 'rgb(128 25 34)' },
    { type: 'color', key: 'ichimoku-chikou', default: 'rgb(67, 160, 71)' },
    { type: 'color', key: 'ichimoku-senkouA', default: 'rgb(165 214 167)' },
    { type: 'color', key: 'ichimoku-senkouB', default: 'rgb(250 161 164)' },
    { type: 'color', key: 'ichimoku-cloudBull', default: 'rgb(76 175 80 / 50%)' },
    { type: 'color', key: 'ichimoku-cloudBear', default: 'rgb(242 54 69 / 50%)' }
  ]
} as const satisfies StudySchema

type IchimokuParams = InferStudyValues<typeof ICHIMOKU_SCHEMA.inputs> &
  InferStudyValues<typeof ICHIMOKU_SCHEMA.style> &
  InferStudyValues<typeof ICHIMOKU_SCHEMA.text>

export class IchimokuCloud extends AbstractIndicator implements Indicator {
  static readonly ikey = 'ichimoku' as const

  #chart: IChartApi
  #params: IchimokuParams
  #fill: IchimokuCloudFill
  #lastChikou = NaN

  #series: {
    tenkan: ISeriesApi<SeriesType>
    kijun: ISeriesApi<SeriesType>
    senkouA: ISeriesApi<SeriesType>
    senkouB: ISeriesApi<SeriesType>
    chikou: ISeriesApi<SeriesType>
  }

  constructor(chart: IChartApi, datafeed: Datafeed, options: IndicatorOptions) {
    super(datafeed, options.paneIndex)
    this.#chart = chart
    this.#params = resolveStudyParams(
      ICHIMOKU_SCHEMA.inputs,
      ICHIMOKU_SCHEMA.style,
      ICHIMOKU_SCHEMA.text,
      options.params
    )
    this.#fill = new IchimokuCloudFill(this.#params['ichimoku-cloudBull'], this.#params['ichimoku-cloudBear'])

    this.#series = {
      tenkan: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['ichimoku-tenkan'], priceLineVisible: false },
        this.paneIndex
      ),
      kijun: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['ichimoku-kijun'], priceLineVisible: false },
        this.paneIndex
      ),
      senkouA: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['ichimoku-senkouA'], priceLineVisible: false },
        this.paneIndex
      ),
      senkouB: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['ichimoku-senkouB'], priceLineVisible: false },
        this.paneIndex
      ),
      chikou: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params['ichimoku-chikou'], priceLineVisible: false },
        this.paneIndex
      )
    }

    this.#series.senkouA.attachPrimitive(this.#fill)
  }

  getSchema() {
    return {
      ikey: IchimokuCloud.ikey,
      schema: ICHIMOKU_SCHEMA,
      params: this.#params
    }
  }

  setParams(params: StudyParams) {
    this.#params = resolveStudyParams(ICHIMOKU_SCHEMA.inputs, ICHIMOKU_SCHEMA.style, ICHIMOKU_SCHEMA.text, params)
    this.#series.tenkan.applyOptions({ color: this.#params['ichimoku-tenkan'] })
    this.#series.kijun.applyOptions({ color: this.#params['ichimoku-kijun'] })
    this.#series.senkouA.applyOptions({ color: this.#params['ichimoku-senkouA'] })
    this.#series.senkouB.applyOptions({ color: this.#params['ichimoku-senkouB'] })
    this.#series.chikou.applyOptions({ color: this.#params['ichimoku-chikou'] })
    this.#fill.bull = this.#params['ichimoku-cloudBull']
    this.#fill.bear = this.#params['ichimoku-cloudBear']
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'ICHIMOKU', paneIndex: this.paneIndex, data: [] }
    legend.data.push(
      { value: this.#params['ichimoku-conversionPeriods'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['ichimoku-basePeriods'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['ichimoku-leadingSpanPeriods'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['ichimoku-laggingSpanPeriods'].toString(), color: 'rgb(140, 140, 140)' },
      { value: this.#params['ichimoku-leadingShiftPeriods'].toString(), color: 'rgb(140, 140, 140)' }
    )
    const entries = [
      [this.#series.tenkan, this.#params['ichimoku-tenkan']],
      [this.#series.kijun, this.#params['ichimoku-kijun']]
    ] as const

    for (const [series, color] of entries) {
      const data = seriesData.get(series)
      if (data) legend.data.push({ value: formatPrice((data as LineData<Time>).value), color })
    }

    const chikouData = seriesData.get(this.#series.chikou)
    const chikouValue = (chikouData as LineData<Time>)?.value ?? this.#lastChikou
    if (!isNaN(chikouValue)) {
      legend.data.push({ value: formatPrice(chikouValue), color: this.#params['ichimoku-chikou'] })
    }

    const spanEntries = [
      [this.#series.senkouA, this.#params['ichimoku-senkouA']],
      [this.#series.senkouB, this.#params['ichimoku-senkouB']]
    ] as const

    for (const [series, color] of spanEntries) {
      const data = seriesData.get(series)
      if (data) legend.data.push({ value: formatPrice((data as LineData<Time>).value), color })
    }

    return legend
  }

  protected onData(data: ChartBar[]) {
    const pp = this.#calculate(data)
    this.#series.tenkan.setData(pp.tenkan)
    this.#series.kijun.setData(pp.kijun)
    this.#series.senkouA.setData(pp.senkouA)
    this.#series.senkouB.setData(pp.senkouB)
    this.#series.chikou.setData(pp.chikou)
    this.#fill.set(pp.senkouA, pp.senkouB)

    const last = pp.chikou.at(-1)
    if (last && 'value' in last) this.#lastChikou = last.value
  }

  protected removeSeries() {
    this.#chart.removeSeries(this.#series.tenkan)
    this.#chart.removeSeries(this.#series.kijun)
    this.#chart.removeSeries(this.#series.senkouA)
    this.#chart.removeSeries(this.#series.senkouB)
    this.#chart.removeSeries(this.#series.chikou)
  }

  #calculate(bars: ChartBar[]) {
    const displacement = this.#params['ichimoku-leadingShiftPeriods'] - 1
    const [tenkan, kijun, senkouA, senkouB] = ta.ichimoku(
      bars,
      this.#params['ichimoku-conversionPeriods'],
      this.#params['ichimoku-basePeriods'],
      this.#params['ichimoku-leadingSpanPeriods'],
      displacement
    )

    const tenkanArr = tenkan.toArray()
    const kijunArr = kijun.toArray()
    const senkouAArr = senkouA.toArray()
    const senkouBArr = senkouB.toArray()

    const d = this.#params['ichimoku-laggingSpanPeriods']
    const chikouArr = bars.map((_, i) => {
      const src = i + d
      return src < bars.length ? bars[src].close : NaN
    })

    const toBar = (value: number, i: number) => ({ time: bars[i].time, value: value ?? NaN })

    const barInterval =
      bars.length >= 2 ? (bars[bars.length - 1].time as number) - (bars[bars.length - 2].time as number) : 86400

    const futureSenkouA: LineData<Time>[] = []
    const futureSenkouB: LineData<Time>[] = []
    const spanLen = this.#params['ichimoku-leadingSpanPeriods']

    for (let j = 1; j <= displacement; j++) {
      const futureTime = ((bars[bars.length - 1].time as number) + barInterval * j) as Time
      const srcIdx = bars.length - 1 + j - displacement

      if (srcIdx >= 0) {
        const t = tenkanArr[srcIdx]
        const k = kijunArr[srcIdx]
        if (!isNaN(t) && !isNaN(k)) {
          futureSenkouA.push({ time: futureTime, value: (t + k) / 2 })
        }

        const start = Math.max(0, srcIdx - spanLen + 1)
        let hi = -Infinity
        let lo = Infinity
        for (let n = start; n <= srcIdx; n++) {
          if (bars[n].high > hi) hi = bars[n].high
          if (bars[n].low < lo) lo = bars[n].low
        }
        if (hi !== -Infinity && lo !== Infinity) {
          futureSenkouB.push({ time: futureTime, value: (hi + lo) / 2 })
        }
      }
    }

    return {
      tenkan: this.filter(tenkanArr.map(toBar)),
      kijun: this.filter(kijunArr.map(toBar)),
      senkouA: [...this.filter(senkouAArr.map(toBar)), ...futureSenkouA],
      senkouB: [...this.filter(senkouBArr.map(toBar)), ...futureSenkouB],
      chikou: this.filter(chikouArr.map(toBar))
    }
  }
}

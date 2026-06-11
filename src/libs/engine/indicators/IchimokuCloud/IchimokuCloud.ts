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
  inputs: [
    { type: 'number', key: 'conversionPeriods', default: 9, min: 1 },
    { type: 'number', key: 'basePeriods', default: 26, min: 1 },
    { type: 'number', key: 'leadingSpanPeriods', default: 52, min: 1 },
    { type: 'number', key: 'laggingSpanPeriods', default: 26, min: 1 },
    { type: 'number', key: 'leadingShiftPeriods', default: 26, min: 1 }
  ],
  style: [
    { type: 'color', key: 'tenkan', default: 'rgb(33 150 243)' },
    { type: 'color', key: 'kijun', default: 'rgb(128 25 34)' },
    { type: 'color', key: 'chikou', default: 'rgb(67, 160, 71)' },
    { type: 'color', key: 'senkouA', default: 'rgb(165 214 167)' },
    { type: 'color', key: 'senkouB', default: 'rgb(250 161 164)' },
    { type: 'color', key: 'cloudBull', default: 'rgb(76 175 80 / 50%)' },
    { type: 'color', key: 'cloudBear', default: 'rgb(242 54 69 / 50%)' }
  ]
} as const satisfies StudySchema

type IchimokuParams = InferStudyValues<typeof ICHIMOKU_SCHEMA.inputs> & InferStudyValues<typeof ICHIMOKU_SCHEMA.style>

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
    this.#params = resolveStudyParams(ICHIMOKU_SCHEMA.inputs, ICHIMOKU_SCHEMA.style, options.params)
    this.#fill = new IchimokuCloudFill(this.#params.cloudBull, this.#params.cloudBear)

    this.#series = {
      tenkan: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.tenkan, priceLineVisible: false },
        this.paneIndex
      ),
      kijun: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.kijun, priceLineVisible: false },
        this.paneIndex
      ),
      senkouA: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.senkouA, priceLineVisible: false },
        this.paneIndex
      ),
      senkouB: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.senkouB, priceLineVisible: false },
        this.paneIndex
      ),
      chikou: this.#chart.addSeries(
        LineSeries,
        { ...COMMON_SERIES_SETTINGS, lineWidth: 1, color: this.#params.chikou, priceLineVisible: false },
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
    this.#params = resolveStudyParams(ICHIMOKU_SCHEMA.inputs, ICHIMOKU_SCHEMA.style, params)
    this.#series.tenkan.applyOptions({ color: this.#params.tenkan })
    this.#series.kijun.applyOptions({ color: this.#params.kijun })
    this.#series.senkouA.applyOptions({ color: this.#params.senkouA })
    this.#series.senkouB.applyOptions({ color: this.#params.senkouB })
    this.#series.chikou.applyOptions({ color: this.#params.chikou })
    this.#fill.bull = this.#params.cloudBull
    this.#fill.bear = this.#params.cloudBear
  }

  getLegend(seriesData: SeriesMap) {
    const legend: SeriesLegend = { key: 'ICHIMOKU', paneIndex: this.paneIndex, data: [] }
    const entries = [
      [this.#series.tenkan, this.#params.tenkan],
      [this.#series.kijun, this.#params.kijun]
    ] as const

    for (const [series, color] of entries) {
      const data = seriesData.get(series)
      if (data) legend.data.push({ value: formatPrice((data as LineData<Time>).value), color })
    }

    const chikouData = seriesData.get(this.#series.chikou)
    const chikouValue = (chikouData as LineData<Time>)?.value ?? this.#lastChikou
    if (!isNaN(chikouValue)) {
      legend.data.push({ value: formatPrice(chikouValue), color: this.#params.chikou })
    }

    const spanEntries = [
      [this.#series.senkouA, this.#params.senkouA],
      [this.#series.senkouB, this.#params.senkouB]
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
    const [tenkan, kijun, senkouA, senkouB] = ta.ichimoku(
      bars,
      this.#params.conversionPeriods,
      this.#params.basePeriods,
      this.#params.leadingSpanPeriods,
      this.#params.leadingShiftPeriods
    )

    const tenkanArr = tenkan.toArray()
    const kijunArr = kijun.toArray()
    const senkouAArr = senkouA.toArray()
    const senkouBArr = senkouB.toArray()

    const d = this.#params.laggingSpanPeriods
    const chikouArr = bars.map((_, i) => {
      const src = i + d
      return src < bars.length ? bars[src].close : NaN
    })

    const toBar = (value: number, i: number) => ({ time: bars[i].time, value: value ?? NaN })

    return {
      tenkan: this.filter(tenkanArr.map(toBar)),
      kijun: this.filter(kijunArr.map(toBar)),
      senkouA: this.filter(senkouAArr.map(toBar)),
      senkouB: this.filter(senkouBArr.map(toBar)),
      chikou: this.filter(chikouArr.map(toBar))
    }
  }
}

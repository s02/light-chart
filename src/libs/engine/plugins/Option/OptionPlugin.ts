import { getBarPrice, getBarTime } from '@engine/helpers'
import { OptionPluginPaneView } from './OptionPluginPaneView'
import type {
  IChartApi,
  ISeriesApi,
  ISeriesPrimitive,
  SeriesAttachedParameter,
  SeriesType,
  Time
} from 'lightweight-charts'
import type { ChartOption, ResolutionId } from '@engine/types'

export class OptionPlugin implements ISeriesPrimitive<Time> {
  #chart: IChartApi
  #option: ChartOption
  #series: ISeriesApi<SeriesType> | null = null
  #resolution: ResolutionId
  #paneViews: OptionPluginPaneView[]

  constructor(chart: IChartApi, option: ChartOption, resolution: ResolutionId) {
    this.#chart = chart
    this.#resolution = resolution
    this.#option = option
    this.#paneViews = [new OptionPluginPaneView(this)]
  }

  attached({ series }: SeriesAttachedParameter<Time>) {
    this.#series = series as ISeriesApi<SeriesType>
  }

  detached() {
    this.#series = null
  }

  getLastBarTime() {
    return getBarTime(this.#series?.data().at(-1))
  }

  getOption() {
    return this.#option
  }

  isOptionProfitable() {
    const lastBarPrice = this.#getLastBarPrice()

    if (!lastBarPrice) {
      return false
    }

    return (
      (this.#option.kind === 'up' && lastBarPrice > this.#option.quoteOpen) ||
      (this.#option.kind === 'down' && lastBarPrice < this.#option.quoteOpen)
    )
  }

  getChart() {
    return this.#chart
  }

  getSeries() {
    return this.#series
  }

  getResolution() {
    return this.#resolution
  }

  updateAllViews() {
    this.#paneViews.forEach((pw) => pw.update())
  }

  paneViews() {
    return this.#paneViews
  }

  #getLastBarPrice() {
    const lastBar = this.#series?.data().at(-1)
    return getBarPrice(lastBar)
  }
}

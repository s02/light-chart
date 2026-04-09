import { createChart } from 'lightweight-charts'
import type { IChartApi, ISeriesApi, ISeriesPrimitive, SeriesType, Time } from 'lightweight-charts'
import { CHART_PARAMS, SERIES_PARAMS, SERIES_SETTINGS } from './constants'
import type { ResolutionId, SeriesId } from './constants'
import { ExpirationPlugin } from './ExpirationPlugin'
import { OptionPlugin } from './OptionPlugin'

type Params = {
  datafeed: Datafeed
  expiration: ChartExpiration
  onResolutionChange?: (resolution: ResolutionId) => void
  onSeriesChange?: (series: SeriesId) => void
  onAssetSymbolChange?: (asset: AssetSymbol) => void
}

export class Chart {
  #chart: IChartApi
  #datafeed: Datafeed
  #series: ISeriesApi<SeriesType>
  #expirationShape: {
    expiration: ChartExpiration
    shape: ISeriesPrimitive<Time>
  }
  #optionShapes: { option: ChartOption; shape: ISeriesPrimitive<Time> }[] = []
  #onResolutionChange?: (resolution: ResolutionId) => void
  #onSeriesChange?: (series: SeriesId) => void
  #onAssetSymbolChange?: (asset: AssetSymbol) => void

  constructor(el: HTMLElement, params: Params) {
    this.#chart = createChart(el, CHART_PARAMS)
    this.#series = this.#chart.addSeries(SERIES_SETTINGS['candlestick'].series, SERIES_PARAMS)
    this.#datafeed = params.datafeed
    this.#onResolutionChange = params.onResolutionChange
    this.#onSeriesChange = params.onSeriesChange
    this.#expirationShape = this.#createExpirationShape(params.expiration)
    this.#initDatafeed().then(() => {
      this.#chart.timeScale().subscribeVisibleLogicalRangeChange(async (range) => {
        if (!range) {
          return
        }

        if (range.from < 10) {
          this.#datafeed.loadHistory()
        }
      })
    })
  }

  setSeriesId(seriesId: SeriesId) {
    if (this.#series) {
      this.#chart.removeSeries(this.#series)
    }

    this.#series = this.#chart.addSeries(SERIES_SETTINGS[seriesId].series, SERIES_PARAMS)
    this.#series.setData(this.#datafeed.getBars())
    this.#drawExpirationShape()
    this.#drawOptionShapes()

    if (this.#onSeriesChange) {
      this.#onSeriesChange(seriesId)
    }
  }

  async setDatafeed(datafeed: Datafeed) {
    const resolutionId = this.#datafeed.getResolutionId()
    const asset = this.#datafeed.getAssetSymbol()

    await this.#datafeed.unsubscribe()
    this.#datafeed = datafeed

    this.#clearExpirationShape()
    this.#clearOptionShapes()
    this.#expirationShape = this.#createExpirationShape(this.#expirationShape.expiration)
    this.#optionShapes = this.#optionShapes.map((optShape) => this.#createOptionShape(optShape.option))

    await this.#initDatafeed()

    if (this.#onResolutionChange && resolutionId !== this.#datafeed.getResolutionId()) {
      this.#onResolutionChange(datafeed.getResolutionId())
    }

    if (this.#onAssetSymbolChange && asset.id !== this.#datafeed.getAssetSymbol().id) {
      this.#onAssetSymbolChange(this.#datafeed.getAssetSymbol())
    }
  }

  setOptions(options: ChartOption[]) {
    this.#clearOptionShapes()

    this.#optionShapes = []
    options.forEach((option) => {
      this.#optionShapes.push(this.#createOptionShape(option))
    })

    this.#drawOptionShapes()
  }

  setExpiration(expiration: ChartExpiration) {
    this.#clearExpirationShape()
    this.#expirationShape = this.#createExpirationShape(expiration)
    this.#drawExpirationShape()
  }

  #clearExpirationShape() {
    if (this.#expirationShape.shape) {
      this.#series.detachPrimitive(this.#expirationShape.shape)
    }
  }

  #drawExpirationShape() {
    this.#series.attachPrimitive(this.#expirationShape.shape)
  }

  #clearOptionShapes() {
    this.#optionShapes.forEach(({ shape }) => this.#series.detachPrimitive(shape))
  }

  #drawOptionShapes() {
    this.#optionShapes.forEach(({ shape }) => this.#series.attachPrimitive(shape))
  }

  #createExpirationShape(expiration: ChartExpiration) {
    return {
      expiration,
      shape: new ExpirationPlugin(this.#chart, expiration, this.#datafeed.getResolutionId())
    }
  }

  #createOptionShape(option: ChartOption) {
    return {
      option,
      shape: new OptionPlugin(this.#chart, option, this.#datafeed.getResolutionId())
    }
  }

  #initDatafeed(): Promise<void> {
    return new Promise((resolve) => {
      this.#datafeed.subscribe((ev) => {
        if (ev.type === 'set') {
          this.#series.setData(ev.data)
          this.#drawExpirationShape()
          this.#drawOptionShapes()
          resolve()
        } else {
          ev.data.forEach((bar) => this.#series.update(bar))
        }
      })
    })
  }
}

export type DatafeedCallbackFn = (result: { type: 'set' | 'update'; data: ChartBar[] }) => void

export type Datafeed = {
  getAssetSymbol(): AssetSymbol
  getResolutionId(): ResolutionId
  getBars(): ChartBar[]
  loadHistory(): Promise<void>
  unsubscribe: () => void
  subscribe: (callback: DatafeedCallbackFn) => Promise<void>
}

export type ChartExpiration = {
  close: Time
  lock: Time
}

export type ChartBar = {
  time: Time
  open: number
  high: number
  low: number
  close: number
  value: number
}

export type ChartOption = {
  id: number
  quoteOpen: number
  createdAt: Time
  expirationDate: Time
  kind: 'up' | 'down'
}

export type AssetSymbol = {
  id: string
  name: string
}

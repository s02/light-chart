import { RESOLUTION_SETTINGS } from '@engine/constants'
import { LegendPlugin } from '@engine/LegendPlugin'
import { CloseBarCountdownPlugin } from '@engine/CloseBarCountdownPlugin'
import type { AssetSymbol, ResolutionId } from '@engine/types'
import type { IChartApi, ISeriesApi, ISeriesPrimitive, SeriesType, Time } from 'lightweight-charts'

type Config = {
  assetSymbol: AssetSymbol
  resolutionId: ResolutionId
}

export class PluginOverlay {
  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #config: Config
  #plugins: ISeriesPrimitive<Time>[] = []

  constructor(chart: IChartApi, series: ISeriesApi<SeriesType>, config: Config) {
    this.#series = series
    this.#chart = chart
    this.#config = config

    this.#setupPlugins()
    this.#attach()
  }

  #setupPlugins() {
    const resolution = RESOLUTION_SETTINGS[this.#config.resolutionId].name
    this.#plugins = [
      new LegendPlugin(this.#chart, `${this.#config.assetSymbol.name} | ${resolution}`),
      new CloseBarCountdownPlugin(this.#config.resolutionId)
    ]
  }

  #attach() {
    this.#plugins.forEach((plugin) => {
      this.#series.attachPrimitive(plugin)
    })
  }

  setConfig(config: Config) {
    this.clear()
    this.#config = config
    this.#setupPlugins()
    this.#attach()
  }

  setSeries(series: ISeriesApi<SeriesType>) {
    this.clear()
    this.#series = series
    this.#attach()
  }

  clear() {
    this.#plugins.forEach((plugin) => {
      this.#series.detachPrimitive(plugin)
    })
  }
}

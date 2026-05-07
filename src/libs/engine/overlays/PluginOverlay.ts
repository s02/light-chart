import { RESOLUTION_SETTINGS } from '@engine/constants'
import { LegendPlugin } from '@engine/plugins/LegendPlugin'
import { CloseBarCountdownPlugin } from '@engine/plugins/CloseBarCountdownPlugin'
import type { AssetSymbol, ResolutionId } from '@engine/types'
import type { IChartApi, ISeriesApi, ISeriesPrimitive, SeriesType, Time } from 'lightweight-charts'

export class PluginOverlay {
  #chart: IChartApi
  #series: ISeriesApi<SeriesType>
  #assetSymbol: AssetSymbol
  #resolutionId: ResolutionId
  #plugins: ISeriesPrimitive<Time>[] = []

  constructor(chart: IChartApi, series: ISeriesApi<SeriesType>, assetSymbol: AssetSymbol, resolutionId: ResolutionId) {
    this.#series = series
    this.#chart = chart
    this.#assetSymbol = assetSymbol
    this.#resolutionId = resolutionId

    const resolution = RESOLUTION_SETTINGS[this.#resolutionId].name
    this.#plugins = [
      new LegendPlugin(this.#chart, `${this.#assetSymbol.name} | ${resolution}`),
      new CloseBarCountdownPlugin(this.#resolutionId)
    ]

    this.#plugins.forEach((plugin) => {
      this.#series.attachPrimitive(plugin)
    })
  }

  destroy() {
    this.#plugins.forEach((plugin) => {
      this.#series.detachPrimitive(plugin)
    })
  }
}

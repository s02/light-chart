import { CloseBarCountdownPlugin } from '@engine/plugins/CloseBarCountdownPlugin'
import type { ResolutionId } from '@engine/types'
import type { ISeriesApi, ISeriesPrimitive, SeriesType, Time } from 'lightweight-charts'

export class PluginOverlay {
  #series: ISeriesApi<SeriesType>
  #resolutionId: ResolutionId
  #plugins: ISeriesPrimitive<Time>[] = []

  constructor(series: ISeriesApi<SeriesType>, resolutionId: ResolutionId) {
    this.#series = series
    this.#resolutionId = resolutionId
    this.#plugins = this.#createPlugins()
    this.#attach()
  }

  setResolutionId(resolutionId: ResolutionId) {
    this.destroy()
    this.#resolutionId = resolutionId
    this.#plugins = this.#createPlugins()
    this.#attach()
  }

  setSeries(series: ISeriesApi<SeriesType>) {
    this.destroy()
    this.#series = series

    this.#attach()
  }

  destroy() {
    this.#plugins.forEach((plugin) => {
      this.#series.detachPrimitive(plugin)
    })
  }

  #attach() {
    this.#plugins.forEach((plugin) => {
      this.#series.attachPrimitive(plugin)
    })
  }

  #createPlugins() {
    return [new CloseBarCountdownPlugin(this.#resolutionId)]
  }
}

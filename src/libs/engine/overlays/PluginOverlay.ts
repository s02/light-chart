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

    this.#plugins = [new CloseBarCountdownPlugin(this.#resolutionId)]

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

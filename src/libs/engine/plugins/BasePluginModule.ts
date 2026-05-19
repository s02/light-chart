import type { PluginModule } from '@engine/plugins/types'
import type { ResolutionId } from '@engine/types'
import type { ISeriesApi, ISeriesPrimitive, SeriesType, Time } from 'lightweight-charts'

export abstract class BasePluginModule implements PluginModule {
  protected resolutionId: ResolutionId
  protected series: ISeriesApi<SeriesType> | null = null
  #plugins: ISeriesPrimitive<Time>[] = []

  constructor(resolutionId: ResolutionId) {
    this.resolutionId = resolutionId
  }

  attach(series: ISeriesApi<SeriesType>) {
    this.series = series
    this.#plugins = this.createPlugins()
    this.#plugins.forEach((plugin) => this.series!.attachPrimitive(plugin))
  }

  detach() {
    if (this.series) {
      this.#plugins.forEach((plugin) => this.series!.detachPrimitive(plugin))
      this.#plugins = []
    }
  }

  setSeries(series: ISeriesApi<SeriesType>) {
    this.detach()
    this.attach(series)
  }

  setResolution(id: ResolutionId) {
    this.detach()
    this.resolutionId = id

    if (this.series) {
      this.attach(this.series)
    }
  }

  abstract createPlugins(): ISeriesPrimitive<Time>[]
}

import { BasePluginModule } from '../BasePluginModule'
import { ExpirationLinesPlugin } from './ExpirationLinesPlugin'
import type { ChartExpiration, ResolutionId } from '@engine/types'
import type { IChartApi } from 'lightweight-charts'

export class ExpirationLineModule extends BasePluginModule {
  #chart: IChartApi
  #expiration: ChartExpiration | null = null

  constructor(chart: IChartApi, resolutionId: ResolutionId) {
    super(resolutionId)
    this.#chart = chart
  }

  setExpiration(expiration: ChartExpiration) {
    this.#expiration = expiration
    this.detach()
    if (this.series) {
      this.attach(this.series)
    }
  }

  createPlugins() {
    if (this.#expiration) {
      return [new ExpirationLinesPlugin(this.#chart, this.#expiration, this.resolutionId)]
    }

    return []
  }
}

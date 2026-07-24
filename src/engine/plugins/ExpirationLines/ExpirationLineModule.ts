import { BasePluginModule } from '../BasePluginModule'
import { ExpirationLinesPlugin } from './ExpirationLinesPlugin'
import type { ChartExpiration, ResolutionId } from '@engine/types'
import type { IChartApi } from 'lightweight-charts'

export class ExpirationLineModule extends BasePluginModule {
  #chart: IChartApi
  #expiration?: ChartExpiration
  #offset?: number
  #timeZone: string

  constructor(chart: IChartApi, resolutionId: ResolutionId, timeZone: string) {
    super(resolutionId)
    this.#chart = chart
    this.#timeZone = timeZone
  }

  setExpiration(expiration?: ChartExpiration) {
    this.#expiration = expiration
    this.detach()
    if (this.series) {
      this.attach(this.series)
    }
  }

  setOffset(offset?: number) {
    this.#offset = offset
    this.detach()
    if (this.series) {
      this.attach(this.series)
    }
  }

  createPlugins() {
    return [new ExpirationLinesPlugin(this.#chart, this.#expiration, this.#offset, this.resolutionId, this.#timeZone)]
  }
}

import { BasePluginModule } from '../BasePluginModule'
import { OptionPlugin } from './OptionPlugin'
import type { ChartOption, ResolutionId } from '@engine/types'
import type { IChartApi } from 'lightweight-charts'

export class OptionModule extends BasePluginModule {
  #chart: IChartApi
  #options: ChartOption[] = []

  constructor(chart: IChartApi, resolutionId: ResolutionId) {
    super(resolutionId)
    this.#chart = chart
  }

  setOptions(options: ChartOption[]) {
    this.#options = options
    this.detach()
    if (this.series) {
      this.attach(this.series)
    }
  }

  createPlugins() {
    return this.#options.map((option) => new OptionPlugin(this.#chart, option, this.resolutionId))
  }
}

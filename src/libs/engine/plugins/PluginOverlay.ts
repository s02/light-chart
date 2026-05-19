import { OptionModule } from './Option/OptionModule'
import { BasePluginModule } from '@engine/plugins/BasePluginModule'
import { CloseBarCountdownPlugin } from '@engine/plugins/CloseBarCountdown/CloseBarCountdownPlugin'
import type { ResolutionId } from '@engine/types'
import type { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts'
import { ExpirationLineModule } from '@engine/plugins/ExpirationLines/ExpirationLineModule'

export class PluginOverlay extends BasePluginModule {
  #chart: IChartApi
  readonly option: OptionModule
  readonly exp: ExpirationLineModule

  constructor(chart: IChartApi, resolutionId: ResolutionId) {
    super(resolutionId)
    this.#chart = chart

    this.option = new OptionModule(this.#chart, this.resolutionId)
    this.exp = new ExpirationLineModule(this.#chart, this.resolutionId)
  }

  override attach(series: ISeriesApi<SeriesType>) {
    super.attach(series)
    this.option.attach(series)
    this.exp.attach(series)
  }

  override detach() {
    super.detach()
    this.option.detach()
    this.exp.detach()
  }

  override setResolution(id: ResolutionId) {
    super.setResolution(id)
    this.option.setResolution(id)
    this.exp.setResolution(id)
  }

  createPlugins() {
    return [new CloseBarCountdownPlugin(this.resolutionId)]
  }
}

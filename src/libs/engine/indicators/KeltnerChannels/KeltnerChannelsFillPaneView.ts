import type { KeltnerChannelsFill } from '@engine/indicators/KeltnerChannels/KeltnerChannelsFill'
import { KeltnerChannelsFillRenderer } from '@engine/indicators/KeltnerChannels/KeltnerChannelsFillRenderer'
import type { IPrimitivePaneView } from 'lightweight-charts'

export class KeltnerChannelsFillPaneView implements IPrimitivePaneView {
  #primitive: KeltnerChannelsFill

  constructor(primitive: KeltnerChannelsFill) {
    this.#primitive = primitive
  }

  zOrder() {
    return 'bottom' as const
  }

  renderer() {
    const { chart, series, points } = this.#primitive
    if (!chart || !series) return null
    return new KeltnerChannelsFillRenderer(points, chart, series, this.#primitive.params)
  }
}

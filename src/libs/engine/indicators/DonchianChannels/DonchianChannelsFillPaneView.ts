import { DonchianChannelsFillRenderer } from './DonchianChannelsFillRenderer'
import type { DonchianChannelsFill } from './DonchianChannelsFill'
import type { IPrimitivePaneView } from 'lightweight-charts'

export class DonchianChannelsFillPaneView implements IPrimitivePaneView {
  #primitive: DonchianChannelsFill

  constructor(primitive: DonchianChannelsFill) {
    this.#primitive = primitive
  }

  zOrder() {
    return 'bottom' as const
  }

  renderer() {
    const { chart, series, points, color } = this.#primitive
    if (!chart || !series) return null
    return new DonchianChannelsFillRenderer(points, chart, series, color)
  }
}

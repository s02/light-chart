import { PriceChannelFillRenderer } from './PriceChannelFillRenderer'
import type { PriceChannelFill } from './PriceChannelFill'
import type { IPrimitivePaneView } from 'lightweight-charts'

export class PriceChannelFillPaneView implements IPrimitivePaneView {
  #primitive: PriceChannelFill

  constructor(primitive: PriceChannelFill) {
    this.#primitive = primitive
  }

  zOrder() {
    return 'bottom' as const
  }

  renderer() {
    const { chart, series, points, color } = this.#primitive
    if (!chart || !series) return null
    return new PriceChannelFillRenderer(points, chart, series, color)
  }
}

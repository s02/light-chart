import type { IchimokuCloudFill } from '@engine/indicators/IchimokuCloud/IchimokuCloudFill'
import { IchimokuCloudFillRenderer } from '@engine/indicators/IchimokuCloud/IchimokuCloudFillRenderer'
import type { IPrimitivePaneView } from 'lightweight-charts'

export class IchimokuCloudFillPaneView implements IPrimitivePaneView {
  #primitive: IchimokuCloudFill

  constructor(primitive: IchimokuCloudFill) {
    this.#primitive = primitive
  }

  zOrder() {
    return 'bottom' as const
  }

  renderer() {
    const { chart, series, points } = this.#primitive
    if (!chart || !series) return null
    return new IchimokuCloudFillRenderer(points, chart, series, this.#primitive.bull, this.#primitive.bear)
  }
}

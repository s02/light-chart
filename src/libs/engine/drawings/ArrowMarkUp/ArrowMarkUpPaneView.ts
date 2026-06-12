import { ArrowMarkUpRenderer } from '@engine/drawings/ArrowMarkUp/ArrowMarkUpRenderer'
import type { ArrowMarkUpParams } from '@engine/drawings/ArrowMarkUp/ArrowMarkUp'
import type { DrawingViewport } from '@engine/drawings/types'
import type { Anchor } from '@engine/points'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'

export class ArrowMarkUpPaneView implements IPrimitivePaneView {
  #viewport: DrawingViewport
  #anchor: Anchor
  #params: ArrowMarkUpParams

  constructor(viewport: DrawingViewport, anchor: Anchor, params: ArrowMarkUpParams) {
    this.#viewport = viewport
    this.#anchor = anchor
    this.#params = params
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'top'
  }

  renderer() {
    const p = this.#viewport.anchorToPoint(this.#anchor)
    return p ? new ArrowMarkUpRenderer(p, this.#params) : null
  }
}

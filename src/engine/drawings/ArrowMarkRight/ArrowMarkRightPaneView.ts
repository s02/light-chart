import { ArrowMarkRightRenderer } from '@engine/drawings/ArrowMarkRight/ArrowMarkRightRenderer'
import type { ArrowMarkRightParams } from '@engine/drawings/ArrowMarkRight/ArrowMarkRight'
import type { DrawingViewport } from '@engine/drawings/types'
import type { Anchor } from '@engine/points'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'

export class ArrowMarkRightPaneView implements IPrimitivePaneView {
  #viewport: DrawingViewport
  #anchor: Anchor
  #params: ArrowMarkRightParams

  constructor(viewport: DrawingViewport, anchor: Anchor, params: ArrowMarkRightParams) {
    this.#viewport = viewport
    this.#anchor = anchor
    this.#params = params
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'top'
  }

  renderer() {
    const p = this.#viewport.anchorToPoint(this.#anchor)
    return p ? new ArrowMarkRightRenderer(p, this.#params) : null
  }
}

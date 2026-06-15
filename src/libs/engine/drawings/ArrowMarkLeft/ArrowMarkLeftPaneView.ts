import { ArrowMarkLeftRenderer } from '@engine/drawings/ArrowMarkLeft/ArrowMarkLeftRenderer'
import type { ArrowMarkLeftParams } from '@engine/drawings/ArrowMarkLeft/ArrowMarkLeft'
import type { DrawingViewport } from '@engine/drawings/types'
import type { Anchor } from '@engine/points'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'

export class ArrowMarkLeftPaneView implements IPrimitivePaneView {
  #viewport: DrawingViewport
  #anchor: Anchor
  #params: ArrowMarkLeftParams

  constructor(viewport: DrawingViewport, anchor: Anchor, params: ArrowMarkLeftParams) {
    this.#viewport = viewport
    this.#anchor = anchor
    this.#params = params
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'top'
  }

  renderer() {
    const p = this.#viewport.anchorToPoint(this.#anchor)
    return p ? new ArrowMarkLeftRenderer(p, this.#params) : null
  }
}

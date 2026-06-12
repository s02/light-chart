import { ArrowMarkDownRenderer } from '@engine/drawings/ArrowMarkDown/ArrowMarkDownRenderer'
import type { ArrowMarkDownParams } from '@engine/drawings/ArrowMarkDown/ArrowMarkDown'
import type { DrawingViewport } from '@engine/drawings/types'
import type { Anchor } from '@engine/points'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'

export class ArrowMarkDownPaneView implements IPrimitivePaneView {
  #viewport: DrawingViewport
  #anchor: Anchor
  #params: ArrowMarkDownParams

  constructor(viewport: DrawingViewport, anchor: Anchor, params: ArrowMarkDownParams) {
    this.#viewport = viewport
    this.#anchor = anchor
    this.#params = params
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'top'
  }

  renderer() {
    const p = this.#viewport.anchorToPoint(this.#anchor)
    return p ? new ArrowMarkDownRenderer(p, this.#params) : null
  }
}

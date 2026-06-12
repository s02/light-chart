import { CrossRenderer } from '@engine/drawings/Cross/CrossRenderer'
import type { CrossParams } from '@engine/drawings/Cross/Cross'
import type { DrawingViewport } from '@engine/drawings/types'
import type { Anchor } from '@engine/points'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'

export class CrossPaneView implements IPrimitivePaneView {
  #viewport: DrawingViewport
  #anchor: Anchor
  #withDots: boolean
  #params: CrossParams

  constructor(viewport: DrawingViewport, anchor: Anchor, withDots: boolean, params: CrossParams) {
    this.#viewport = viewport
    this.#anchor = anchor
    this.#withDots = withDots
    this.#params = params
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'normal'
  }

  renderer() {
    const p = this.#viewport.anchorToPoint(this.#anchor)
    return p ? new CrossRenderer(p, this.#withDots, this.#params) : null
  }
}

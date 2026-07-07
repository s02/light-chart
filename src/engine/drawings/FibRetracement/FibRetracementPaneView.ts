import type { FibRetracementParams } from '@engine/drawings/FibRetracement/FibRetracement'
import { FibRetracementRenderer } from './FibRetracementRenderer'
import type { DrawingViewport } from '../types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'
import type { Anchor } from '@engine/points'

export class FibRetracementPaneView implements IPrimitivePaneView {
  #anchors: Anchor[]
  #withDots: boolean
  #viewport: DrawingViewport
  #params: FibRetracementParams

  constructor(viewport: DrawingViewport, anchors: Anchor[], withDots: boolean, params: FibRetracementParams) {
    this.#anchors = anchors
    this.#viewport = viewport
    this.#withDots = withDots
    this.#params = params
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'normal'
  }

  renderer() {
    if (this.#anchors.length >= 2) {
      const a1 = this.#anchors[0]
      const a2 = this.#anchors[1]

      const p1 = this.#viewport.anchorToPoint(a1)
      const p2 = this.#viewport.anchorToPoint(a2)

      if (!p1 || !p2) return null

      return new FibRetracementRenderer(p1, p2, this.#withDots, this.#params, a1.price, a2.price)
    }

    return null
  }
}

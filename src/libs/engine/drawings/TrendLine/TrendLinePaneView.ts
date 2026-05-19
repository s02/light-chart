import { TrendLineRenderer } from './TrendLineRenderer'
import type { Anchor, DrawingViewport } from '../types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'

export class TrendLinePaneView implements IPrimitivePaneView {
  #anchors: Anchor[]
  #viewport: DrawingViewport

  constructor(viewport: DrawingViewport, anchors: Anchor[]) {
    this.#anchors = anchors
    this.#viewport = viewport
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'normal'
  }

  renderer() {
    if (this.#anchors.length) {
      const a1 = this.#anchors[0]
      const a2 = this.#anchors.length > 1 ? this.#anchors[1] : this.#anchors[0]

      const p1 = this.#viewport.anchorToPoint(a1)
      const p2 = this.#viewport.anchorToPoint(a2)

      if (!p1 || !p2) {
        return null
      }

      return new TrendLineRenderer(p1, p2)
    }

    return null
  }
}

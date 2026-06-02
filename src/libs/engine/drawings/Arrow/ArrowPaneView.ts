import type { ArrowParams } from '@engine/drawings/Arrow/Arrow'
import { ArrowRenderer } from './ArrowRenderer'
import type { Anchor, DrawingViewport } from '../types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'

export class ArrowPaneView implements IPrimitivePaneView {
  #anchors: Anchor[]
  #withDots: boolean
  #viewport: DrawingViewport
  #params: ArrowParams

  constructor(viewport: DrawingViewport, anchors: Anchor[], withDots: boolean, params: ArrowParams) {
    this.#anchors = anchors
    this.#viewport = viewport
    this.#withDots = withDots
    this.#params = params
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

      return new ArrowRenderer(p1, p2, this.#withDots, this.#params)
    }

    return null
  }
}

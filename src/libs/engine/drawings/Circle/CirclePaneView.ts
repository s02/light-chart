import { CircleRenderer } from '@engine/drawings/Circle/CircleRenderer'
import type { DrawingViewport } from '../types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'
import type { CircleParams } from '@engine/drawings/Circle/Circle'
import type { Anchor } from '@engine/points'

export class CirclePaneView implements IPrimitivePaneView {
  #anchors: Anchor[]
  #withDots: boolean
  #viewport: DrawingViewport
  #params: CircleParams

  constructor(viewport: DrawingViewport, anchors: Anchor[], withDots: boolean, params: CircleParams) {
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

      return new CircleRenderer(p1, p2, this.#withDots, this.#params)
    }

    return null
  }
}

import { RayRenderer } from './RayRenderer'
import type { DrawingViewport } from '../types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'
import type { RayParams } from '@engine/drawings/Ray/Ray'
import type { Anchor } from '@engine/points'

export class RayPaneView implements IPrimitivePaneView {
  #anchors: Anchor[]
  #withDots: boolean
  #viewport: DrawingViewport
  #params: RayParams

  constructor(viewport: DrawingViewport, anchors: Anchor[], withDots: boolean, params: RayParams) {
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

      return new RayRenderer(p1, p2, this.#withDots, this.#params)
    }

    return null
  }
}

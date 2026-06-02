import type { GannSquareParams } from '@engine/drawings/GannSquare/GannSquare'
import { GannSquareRenderer } from './GannSquareRenderer'
import type { Anchor, DrawingViewport } from '../types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'

export class GannSquarePaneView implements IPrimitivePaneView {
  #anchors: Anchor[]
  #withDots: boolean
  #viewport: DrawingViewport
  #params: GannSquareParams

  constructor(viewport: DrawingViewport, anchors: Anchor[], withDots: boolean, params: GannSquareParams) {
    this.#anchors = anchors
    this.#viewport = viewport
    this.#withDots = withDots
    this.#params = params
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'normal'
  }

  renderer() {
    if (!this.#anchors.length) {
      return null
    }

    const a1 = this.#anchors[0]
    const a2 = this.#anchors.length > 1 ? this.#anchors[1] : this.#anchors[0]

    const p1 = this.#viewport.anchorToPoint(a1)
    const p2 = this.#viewport.anchorToPoint(a2)

    if (!p1 || !p2) {
      return null
    }

    return new GannSquareRenderer(p1, p2, this.#withDots, this.#params)
  }
}

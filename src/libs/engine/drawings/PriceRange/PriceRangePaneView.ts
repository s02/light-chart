import type { PriceRangeParams } from '@engine/drawings/PriceRange/PriceRange'
import { PriceRangeRenderer } from './PriceRangeRenderer'
import type { DrawingViewport } from '../types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'
import type { Anchor } from '@engine/points'

export class PriceRangePaneView implements IPrimitivePaneView {
  #anchors: Anchor[]
  #withDots: boolean
  #viewport: DrawingViewport
  #params: PriceRangeParams

  constructor(viewport: DrawingViewport, anchors: Anchor[], withDots: boolean, params: PriceRangeParams) {
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

      if (!p1 || !p2) {
        return null
      }

      const barCount = this.#viewport.barsBetween(a1.time, a2.time)
      const timeDiff = typeof a1.time === 'number' && typeof a2.time === 'number' ? Math.abs(a2.time - a1.time) : null

      return new PriceRangeRenderer(p1, p2, this.#withDots, this.#params, a1.price, a2.price, barCount, timeDiff)
    }

    return null
  }
}

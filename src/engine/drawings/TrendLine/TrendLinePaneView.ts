import { TrendLineRenderer } from './TrendLineRenderer'
import type { DrawingViewport } from '../types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'
import type { TrendLineParams } from '@engine/drawings/TrendLine/TrendLine'
import type { Anchor } from '@engine/points'

export class TrendLinePaneView implements IPrimitivePaneView {
  #anchors: Anchor[]
  #withDots: boolean
  #viewport: DrawingViewport
  #params: TrendLineParams

  constructor(viewport: DrawingViewport, anchors: Anchor[], withDots: boolean, params: TrendLineParams) {
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

      return new TrendLineRenderer(p1, p2, this.#withDots, this.#params)
    }

    return null
  }
}

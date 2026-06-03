import type { DrawingViewport } from '../types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'
import { VerticalLineRenderer } from '@engine/drawings/VerticalLine/VerticalLineRenderer'
import type { VerticalLineParams } from '@engine/drawings/VerticalLine/VerticalLine'
import type { Anchor } from '@engine/points'

export class VerticalLinePaneView implements IPrimitivePaneView {
  #viewport: DrawingViewport
  #anchor: Anchor
  #withDots: boolean
  #params: VerticalLineParams

  constructor(viewport: DrawingViewport, anchor: Anchor, withDots: boolean, params: VerticalLineParams) {
    this.#anchor = anchor
    this.#viewport = viewport
    this.#withDots = withDots
    this.#params = params
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'normal'
  }

  renderer() {
    const p = this.#viewport.anchorToPoint(this.#anchor)
    return p ? new VerticalLineRenderer(p, this.#withDots, this.#params) : null
  }
}

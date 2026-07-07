import { ArrowMarkerRenderer } from './ArrowMarkerRenderer'
import type { ArrowMarkerParams } from './ArrowMarker'
import type { DrawingViewport } from '@engine/drawings/types'
import type { Anchor } from '@engine/points'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'

export class ArrowMarkerPaneView implements IPrimitivePaneView {
  #viewport: DrawingViewport
  #anchors: Anchor[]
  #withDots: boolean
  #params: ArrowMarkerParams

  constructor(viewport: DrawingViewport, anchors: Anchor[], withDots: boolean, params: ArrowMarkerParams) {
    this.#viewport = viewport
    this.#anchors = anchors
    this.#withDots = withDots
    this.#params = params
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'normal'
  }

  renderer() {
    const p1 = this.#viewport.anchorToPoint(this.#anchors[0])
    const p2 = this.#viewport.anchorToPoint(this.#anchors[1])
    if (!p1 || !p2) return null

    return new ArrowMarkerRenderer(p1, p2, this.#withDots, this.#params)
  }
}

import { HorizontalLineRenderer } from './HorizontalLineRenderer'
import type { Anchor, DrawingViewport } from '../types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'

export class HorizontalLinePaneView implements IPrimitivePaneView {
  #viewport: DrawingViewport
  #anchors: [Anchor]

  constructor(viewport: DrawingViewport, anchors: [Anchor]) {
    this.#anchors = anchors
    this.#viewport = viewport
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'normal'
  }

  renderer() {
    const p = this.#viewport.anchorToPoint(this.#anchors[0])
    if (p) {
      return new HorizontalLineRenderer(p.y)
    }

    return null
  }
}

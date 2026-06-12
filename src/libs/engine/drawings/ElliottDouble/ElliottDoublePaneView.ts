import { ElliottDoubleRenderer } from '@engine/drawings/ElliottDouble/ElliottDoubleRenderer'
import type { ElliottDoubleParams } from '@engine/drawings/ElliottDouble/ElliottDouble'
import type { DrawingViewport } from '@engine/drawings/types'
import type { Anchor } from '@engine/points'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'

export class ElliottDoublePaneView implements IPrimitivePaneView {
  #anchors: Anchor[]
  #withDots: boolean
  #viewport: DrawingViewport
  #params: ElliottDoubleParams

  constructor(viewport: DrawingViewport, anchors: Anchor[], withDots: boolean, params: ElliottDoubleParams) {
    this.#anchors = anchors
    this.#viewport = viewport
    this.#withDots = withDots
    this.#params = params
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'normal'
  }

  renderer() {
    if (!this.#anchors.length) return null
    const points = this.#anchors.map((a) => this.#viewport.anchorToPoint(a)).filter((p) => !!p)
    return new ElliottDoubleRenderer(points, this.#withDots, this.#params)
  }
}

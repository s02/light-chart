import type { BrushParams } from '@engine/drawings/Brush/Brush'
import { BrushRenderer } from './BrushRenderer'
import type { DrawingViewport } from '../types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'
import type { Anchor } from '@engine/points'

export class BrushPaneView implements IPrimitivePaneView {
  #anchors: Anchor[]
  #viewport: DrawingViewport
  #params: BrushParams

  constructor(viewport: DrawingViewport, anchors: Anchor[], params: BrushParams) {
    this.#anchors = anchors
    this.#viewport = viewport
    this.#params = params
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'normal'
  }

  renderer() {
    if (!this.#anchors.length) return null

    const points = this.#anchors.map((a) => this.#viewport.anchorToPoint(a)).filter((p) => !!p)
    if (!points.length) return null

    return new BrushRenderer(points, this.#params)
  }
}

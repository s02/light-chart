import type { HighlighterParams } from '@engine/drawings/Highlighter/Highlighter'
import { HighlighterRenderer } from './HighlighterRenderer'
import type { DrawingViewport } from '../types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'
import type { Anchor } from '@engine/points'

export class HighlighterPaneView implements IPrimitivePaneView {
  #anchors: Anchor[]
  #viewport: DrawingViewport
  #params: HighlighterParams

  constructor(viewport: DrawingViewport, anchors: Anchor[], params: HighlighterParams) {
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

    return new HighlighterRenderer(points, this.#params)
  }
}

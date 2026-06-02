import type { ArrowParams } from '@engine/drawings/Arrow/Arrow'
import { PathRenderer } from './PathRenderer'
import type { Anchor, DrawingViewport } from '../types'
import type { IPrimitivePaneView, Point, PrimitivePaneViewZOrder } from 'lightweight-charts'

export class PathPaneView implements IPrimitivePaneView {
  #anchors: Anchor[]
  #withDots: boolean
  #viewport: DrawingViewport
  #params: ArrowParams

  constructor(viewport: DrawingViewport, anchors: Anchor[], withDots: boolean, params: ArrowParams) {
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
      const points = this.#anchors.map((a) => this.#viewport.anchorToPoint(a)).filter((p) => !!p)
      return new PathRenderer(points, this.#withDots, this.#params)
    }

    return null
  }
}

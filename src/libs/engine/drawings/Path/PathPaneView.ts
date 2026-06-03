import { PathRenderer } from './PathRenderer'
import type { DrawingViewport } from '../types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'
import type { Anchor } from '@engine/points'
import type { PathParams } from '@engine/drawings/Path/Path'

export class PathPaneView implements IPrimitivePaneView {
  #anchors: Anchor[]
  #withDots: boolean
  #viewport: DrawingViewport
  #params: PathParams

  constructor(viewport: DrawingViewport, anchors: Anchor[], withDots: boolean, params: PathParams) {
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

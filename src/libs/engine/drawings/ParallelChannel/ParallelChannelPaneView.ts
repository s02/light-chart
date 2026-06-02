import type { ParallelChannelParams } from '@engine/drawings/ParallelChannel/ParallelChannel'
import { ParallelChannelRenderer } from './ParallelChannelRenderer'
import type { Anchor, DrawingViewport } from '../types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'

export class ParallelChannelPaneView implements IPrimitivePaneView {
  #anchors: Anchor[]
  #withDots: boolean
  #viewport: DrawingViewport
  #params: ParallelChannelParams

  constructor(viewport: DrawingViewport, anchors: Anchor[], withDots: boolean, params: ParallelChannelParams) {
    this.#anchors = anchors
    this.#viewport = viewport
    this.#withDots = withDots
    this.#params = params
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'normal'
  }

  renderer() {
    if (!this.#anchors.length) {
      return null
    }

    const points = this.#anchors.map((a) => this.#viewport.anchorToPoint(a)).filter((p) => !!p)
    return new ParallelChannelRenderer(points, this.#withDots, this.#params)
  }
}

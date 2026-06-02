import type { ExtendedLineParams } from '@engine/drawings/ExtendedLine/ExtendedLine'
import { ExtendedLineRenderer } from './ExtendedLineRenderer'
import type { Anchor, DrawingViewport } from '../types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'

export class ExtendedLinePaneView implements IPrimitivePaneView {
  #anchors: Anchor[]
  #withDots: boolean
  #viewport: DrawingViewport
  #params: ExtendedLineParams

  constructor(viewport: DrawingViewport, anchors: Anchor[], withDots: boolean, params: ExtendedLineParams) {
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

      return new ExtendedLineRenderer(p1, p2, this.#withDots, this.#params)
    }

    return null
  }
}

import { HorizontalLineRenderer } from './HorizontalLineRenderer'
import type { DrawingViewport } from '../types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'
import type { HorizontalLineParams } from '@engine/drawings/HorizontalLine/HorizontalLine'
import type { Anchor } from '@engine/points'

export class HorizontalLinePaneView implements IPrimitivePaneView {
  #viewport: DrawingViewport
  #anchor: Anchor
  #withDots: boolean
  #params: HorizontalLineParams

  constructor(viewport: DrawingViewport, anchor: Anchor, withDots: boolean, params: HorizontalLineParams) {
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
    return p ? new HorizontalLineRenderer(p, this.#withDots, this.#params) : null
  }
}

import { HorizontalRayRenderer } from './HorizontalRayRenderer'
import type { DrawingViewport } from '../types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'
import type { HorizontalRayParams } from './HorizontalRay'
import type { Anchor } from '@engine/points'

export class HorizontalRayPaneView implements IPrimitivePaneView {
  #anchor: Anchor
  #withDots: boolean
  #viewport: DrawingViewport
  #params: HorizontalRayParams

  constructor(viewport: DrawingViewport, anchor: Anchor, withDots: boolean, params: HorizontalRayParams) {
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
    return p ? new HorizontalRayRenderer(p, this.#withDots, this.#params) : null
  }
}

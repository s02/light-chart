import { CalloutRenderer } from './CalloutRenderer'
import type { CalloutParams } from './Callout'
import type { DrawingViewport } from '@engine/drawings/types'
import type { Anchor } from '@engine/points'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'

export class CalloutPaneView implements IPrimitivePaneView {
  #viewport: DrawingViewport
  #tip: Anchor
  #bubble: Anchor
  #withDots: boolean
  #params: CalloutParams

  constructor(viewport: DrawingViewport, tip: Anchor, bubble: Anchor, withDots: boolean, params: CalloutParams) {
    this.#viewport = viewport
    this.#tip = tip
    this.#bubble = bubble
    this.#withDots = withDots
    this.#params = params
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'top'
  }

  renderer() {
    const tip = this.#viewport.anchorToPoint(this.#tip)
    const bubble = this.#viewport.anchorToPoint(this.#bubble)
    if (!tip || !bubble) return null

    return new CalloutRenderer(tip, bubble, this.#withDots, this.#params)
  }
}

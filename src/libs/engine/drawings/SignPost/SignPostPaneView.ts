import { SignPostRenderer } from './SignPostRenderer'
import type { SignPostParams } from './SignPost'
import type { DrawingViewport } from '@engine/drawings/types'
import type { Anchor } from '@engine/points'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'

export class SignPostPaneView implements IPrimitivePaneView {
  #viewport: DrawingViewport
  #anchor: Anchor
  #withDot: boolean
  #params: SignPostParams
  #barHighY: number
  #barLowY: number

  constructor(
    viewport: DrawingViewport,
    anchor: Anchor,
    withDot: boolean,
    params: SignPostParams,
    barHighY: number,
    barLowY: number
  ) {
    this.#viewport = viewport
    this.#anchor = anchor
    this.#withDot = withDot
    this.#params = params
    this.#barHighY = barHighY
    this.#barLowY = barLowY
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'top'
  }

  renderer() {
    const p = this.#viewport.anchorToPoint(this.#anchor)
    if (!p) return null

    return new SignPostRenderer(p, this.#withDot, this.#params, this.#barHighY, this.#barLowY)
  }
}

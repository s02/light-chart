import { TextRenderer } from '@engine/drawings/Text/TextRenderer'
import type { TextParams } from '@engine/drawings/Text/TextDrawing'
import type { DrawingViewport } from '@engine/drawings/types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'
import type { Anchor } from '@engine/points'

export class TextPaneView implements IPrimitivePaneView {
  #anchor: Anchor
  #withDot: boolean
  #viewport: DrawingViewport
  #params: TextParams

  constructor(viewport: DrawingViewport, anchor: Anchor, withDot: boolean, params: TextParams) {
    this.#anchor = anchor
    this.#viewport = viewport
    this.#withDot = withDot
    this.#params = params
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'top'
  }

  renderer() {
    const p = this.#viewport.anchorToPoint(this.#anchor)
    if (!p) {
      return null
    }

    return new TextRenderer(p, this.#withDot, this.#params)
  }
}

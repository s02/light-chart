import { TextRenderer } from '@engine/drawings/Text/TextRenderer'
import type { TextParams } from '@engine/drawings/Text/TextDrawing'
import type { Anchor } from '@engine/drawings/types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'

export class AnchoredTextPaneView implements IPrimitivePaneView {
  #anchor: Anchor
  #withDot: boolean
  #params: TextParams

  constructor(anchor: Anchor, withDot: boolean, params: TextParams) {
    this.#anchor = anchor
    this.#withDot = withDot
    this.#params = params
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'top'
  }

  renderer() {
    const p = { x: this.#anchor.x, y: this.#anchor.y }
    return new TextRenderer(p, this.#withDot, this.#params)
  }
}

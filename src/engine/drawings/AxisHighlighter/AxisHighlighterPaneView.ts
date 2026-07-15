import type { DrawingViewport } from '../types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'
import type { Anchor } from '@engine/points'
import { AxisHighlighterPaneRenderer } from './AxisHighlighterPaneRenderer'

type Params = {
  fillColor?: string
  vertical: boolean
}

export class AxisHighlighterPaneView implements IPrimitivePaneView {
  #anchors: Anchor[]
  #viewport: DrawingViewport
  #fillColor: string
  #vertical: boolean

  constructor(viewport: DrawingViewport, anchors: Anchor[], params: Params) {
    this.#anchors = anchors
    this.#viewport = viewport
    this.#vertical = params.vertical
    this.#fillColor = params.fillColor || 'rgb(41 98 255 / 15%)'
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'bottom'
  }

  renderer() {
    if (this.#anchors.length < 2) {
      return null
    }

    const p1 = this.#viewport.anchorToPoint(this.#anchors[0])
    const p2 = this.#viewport.anchorToPoint(this.#anchors[1])

    if (!p1 || !p2) {
      return null
    }

    const [from, to] = this.#vertical ? [p1.y, p2.y] : [p1.x, p2.x]

    return new AxisHighlighterPaneRenderer(from, to, this.#fillColor, this.#vertical)
  }
}

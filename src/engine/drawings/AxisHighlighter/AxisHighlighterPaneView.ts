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

    const values: number[] = []
    for (const anchor of this.#anchors) {
      const point = this.#viewport.anchorToPoint(anchor)
      if (point) {
        values.push(this.#vertical ? point.y : point.x)
      }
    }

    if (values.length < 2) {
      return null
    }

    const from = Math.min(...values)
    const to = Math.max(...values)

    return new AxisHighlighterPaneRenderer(from, to, this.#fillColor, this.#vertical)
  }
}

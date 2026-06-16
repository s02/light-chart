import type { EmojiParams } from '@engine/drawings/EmojiDrawing/EmojiDrawing'
import { EmojiRenderer } from './EmojiRenderer'
import type { DrawingViewport } from '../types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'
import type { Anchor } from '@engine/points'

export class EmojiPaneView implements IPrimitivePaneView {
  #anchors: Anchor[]
  #withDots: boolean
  #viewport: DrawingViewport
  #params: EmojiParams
  #image: HTMLImageElement | null
  #rotation: number

  constructor(
    viewport: DrawingViewport,
    anchors: Anchor[],
    withDots: boolean,
    params: EmojiParams,
    image: HTMLImageElement | null,
    rotation: number
  ) {
    this.#anchors = anchors
    this.#viewport = viewport
    this.#withDots = withDots
    this.#params = params
    this.#image = image
    this.#rotation = rotation
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'normal'
  }

  renderer() {
    if (this.#anchors.length >= 2) {
      const p1 = this.#viewport.anchorToPoint(this.#anchors[0])
      const p2 = this.#viewport.anchorToPoint(this.#anchors[1])

      if (!p1 || !p2) return null

      return new EmojiRenderer(p1, p2, this.#withDots, this.#params, this.#image, this.#rotation)
    }

    return null
  }
}

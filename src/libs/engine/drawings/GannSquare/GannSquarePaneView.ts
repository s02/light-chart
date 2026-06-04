import type { GannSquareParams } from '@engine/drawings/GannSquare/GannSquare'
import { GannSquareArcRenderer } from '@engine/drawings/GannSquare/GannSquareArcRenderer'
import { GannSquareFanRenderer } from '@engine/drawings/GannSquare/GannSquareFanRenderer'
import { GannSquareRenderer } from '@engine/drawings/GannSquare/GannSquareRenderer'
import type { DrawingViewport } from '../types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'
import type { Anchor } from '@engine/points'

const ARCS: { x: number; y: number }[] = [
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 0 },
  { x: 2, y: 1 },
  { x: 3, y: 0 },
  { x: 3, y: 1 },
  { x: 4, y: 0 },
  { x: 4, y: 1 },
  { x: 5, y: 0 },
  { x: 5, y: 1 }
]

export class GannSquarePaneView {
  #anchors: Anchor[]
  #withDots: boolean
  #viewport: DrawingViewport
  #params: GannSquareParams

  constructor(viewport: DrawingViewport, anchors: Anchor[], withDots: boolean, params: GannSquareParams) {
    this.#anchors = anchors
    this.#viewport = viewport
    this.#withDots = withDots
    this.#params = params
  }

  views(): IPrimitivePaneView[] {
    if (!this.#anchors.length) return []

    const a1 = this.#anchors[0]
    const a2 = this.#anchors.length > 1 ? this.#anchors[1] : this.#anchors[0]
    const p1 = this.#viewport.anchorToPoint(a1)
    const p2 = this.#viewport.anchorToPoint(a2)

    if (!p1 || !p2) return []

    const color = this.#params['line-color']
    const lineWidth = this.#params['line-width']
    const divisions = Math.max(1, Math.round(this.#params['divisions']))
    const minX = Math.min(p1.x, p2.x)
    const minY = Math.min(p1.y, p2.y)
    const maxX = Math.max(p1.x, p2.x)
    const maxY = Math.max(p1.y, p2.y)

    const zOrder = (): PrimitivePaneViewZOrder => 'normal'

    return [
      { zOrder, renderer: () => new GannSquareRenderer(p1, p2, this.#withDots, this.#params) },
      { zOrder, renderer: () => new GannSquareFanRenderer(p1, p2, color, lineWidth) },
      { zOrder, renderer: () => new GannSquareArcRenderer(minX, minY, maxX, maxY, divisions, color, lineWidth, ARCS) }
    ]
  }
}

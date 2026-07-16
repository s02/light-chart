import type { GannSquareParams } from '@engine/drawings/GannSquare/GannSquare'
import { GannSquareArcRenderer } from '@engine/drawings/GannSquare/GannSquareArcRenderer'
import { GannSquareFanRenderer } from '@engine/drawings/GannSquare/GannSquareFanRenderer'
import { GannSquareLabelsRenderer } from '@engine/drawings/GannSquare/GannSquareLabelsRenderer'
import { GannSquareRenderer } from '@engine/drawings/GannSquare/GannSquareRenderer'
import type { DrawingViewport } from '../types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'
import type { Anchor } from '@engine/points'

const ARCS = [
  { x: 1, y: 0, color: 'arc-1-0-color' },
  { x: 1, y: 1, color: 'arc-1-1-color' },
  { x: 1.5, y: 0, color: 'arc-1.5-0-color' },
  { x: 2, y: 0, color: 'arc-2-0-color' },
  { x: 2, y: 1, color: 'arc-2-1-color' },
  { x: 3, y: 0, color: 'arc-3-0-color' },
  { x: 3, y: 1, color: 'arc-3-1-color' },
  { x: 4, y: 0, color: 'arc-4-0-color' },
  { x: 4, y: 1, color: 'arc-4-1-color' },
  { x: 5, y: 0, color: 'arc-5-0-color' },
  { x: 5, y: 1, color: 'arc-5-1-color' }
] as const

const FAN_LINES = [
  { rise: 8, run: 1, color: 'fan-8x1-color' },
  { rise: 5, run: 1, color: 'fan-5x1-color' },
  { rise: 4, run: 1, color: 'fan-4x1-color' },
  { rise: 3, run: 1, color: 'fan-3x1-color' },
  { rise: 2, run: 1, color: 'fan-2x1-color' },
  { rise: 1, run: 1, color: 'fan-1x1-color' },
  { rise: 1, run: 2, color: 'fan-1x2-color' },
  { rise: 1, run: 3, color: 'fan-1x3-color' },
  { rise: 1, run: 4, color: 'fan-1x4-color' },
  { rise: 1, run: 5, color: 'fan-1x5-color' },
  { rise: 1, run: 6, color: 'fan-1x6-color' }
] as const

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

    const lineWidth = this.#params['line-width']
    const barCount = this.#viewport.barsBetween(a1.time, a2.time)
    const priceDiff = a2.price - a1.price

    const zOrder = (): PrimitivePaneViewZOrder => 'normal'

    return [
      { zOrder, renderer: () => new GannSquareRenderer(p1, p2, this.#withDots, this.#params) },
      {
        zOrder,
        renderer: () =>
          new GannSquareLabelsRenderer(
            p1,
            p2,
            this.#params['font-color'],
            this.#params['font-size'],
            barCount,
            priceDiff
          )
      },
      {
        zOrder,
        renderer: () =>
          new GannSquareFanRenderer(
            p1,
            p2,
            lineWidth,
            FAN_LINES.map((f) => ({ ...f, color: this.#params[f.color] }))
          )
      },
      {
        zOrder,
        renderer: () =>
          new GannSquareArcRenderer(
            p1,
            p2,
            lineWidth,
            ARCS.map((arc) => ({ ...arc, color: this.#params[arc.color] }))
          )
      }
    ]
  }
}

import type { GannSquareParams } from '@engine/drawings/GannSquare/GannSquare'
import { GannSquareArcRenderer } from '@engine/drawings/GannSquare/GannSquareArcRenderer'
import { GannSquareFanRenderer } from '@engine/drawings/GannSquare/GannSquareFanRenderer'
import { GannSquareLabelsRenderer } from '@engine/drawings/GannSquare/GannSquareLabelsRenderer'
import { GannSquareRenderer } from '@engine/drawings/GannSquare/GannSquareRenderer'
import type { DrawingViewport } from '../types'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'
import type { Anchor } from '@engine/points'

const ARCS = [
  { x: 1, y: 0, color: 'arc-1x0-color', visible: 'arc-1x0-visible' },
  { x: 1, y: 1, color: 'arc-1x1-color', visible: 'arc-1x1-visible' },
  { x: 1.5, y: 0, color: 'arc-1.5x0-color', visible: 'arc-1.5x0-visible' },
  { x: 2, y: 0, color: 'arc-2x0-color', visible: 'arc-2x0-visible' },
  { x: 2, y: 1, color: 'arc-2x1-color', visible: 'arc-2x1-visible' },
  { x: 3, y: 0, color: 'arc-3x0-color', visible: 'arc-3x0-visible' },
  { x: 3, y: 1, color: 'arc-3x1-color', visible: 'arc-3x1-visible' },
  { x: 4, y: 0, color: 'arc-4x0-color', visible: 'arc-4x0-visible' },
  { x: 4, y: 1, color: 'arc-4x1-color', visible: 'arc-4x1-visible' },
  { x: 5, y: 0, color: 'arc-5x0-color', visible: 'arc-5x0-visible' },
  { x: 5, y: 1, color: 'arc-5x1-color', visible: 'arc-5x1-visible' }
] as const

const FAN_LINES = [
  { rise: 8, run: 1, color: 'fan-8x1-color', visible: 'fan-8x1-visible' },
  { rise: 5, run: 1, color: 'fan-5x1-color', visible: 'fan-5x1-visible' },
  { rise: 4, run: 1, color: 'fan-4x1-color', visible: 'fan-4x1-visible' },
  { rise: 3, run: 1, color: 'fan-3x1-color', visible: 'fan-3x1-visible' },
  { rise: 2, run: 1, color: 'fan-2x1-color', visible: 'fan-2x1-visible' },
  { rise: 1, run: 1, color: 'fan-1x1-color', visible: 'fan-1x1-visible' },
  { rise: 1, run: 2, color: 'fan-1x2-color', visible: 'fan-1x2-visible' },
  { rise: 1, run: 3, color: 'fan-1x3-color', visible: 'fan-1x3-visible' },
  { rise: 1, run: 4, color: 'fan-1x4-color', visible: 'fan-1x4-visible' },
  { rise: 1, run: 5, color: 'fan-1x5-color', visible: 'fan-1x5-visible' },
  { rise: 1, run: 6, color: 'fan-1x6-color', visible: 'fan-1x6-visible' }
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
      ...(this.#params['labels-visible']
        ? [
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
            }
          ]
        : []),
      {
        zOrder,
        renderer: () =>
          new GannSquareFanRenderer(
            p1,
            p2,
            lineWidth,
            FAN_LINES.filter((f) => this.#params[f.visible]).map((f) => ({ ...f, color: this.#params[f.color] }))
          )
      },
      {
        zOrder,
        renderer: () =>
          new GannSquareArcRenderer(
            p1,
            p2,
            lineWidth,
            ARCS.filter((arc) => this.#params[arc.visible]).map((arc) => ({ ...arc, color: this.#params[arc.color] }))
          )
      }
    ]
  }
}

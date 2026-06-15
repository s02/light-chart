import { dot } from '@engine/primitives/dot'
import type { ArrowMarkerParams } from './ArrowMarker'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

// Arrowhead length as a fraction of total arrow length, capped.
function headSize(len: number): number {
  return Math.max(Math.min(len * 0.55, 100), 10)
}

// Stroke width: ~2% of length, clamped to [2, 5] logical px.
function strokeWidth(len: number): number {
  return Math.max(Math.min(Math.round(0.02 * len), 5), 2)
}

export class ArrowMarkerRenderer implements IPrimitivePaneRenderer {
  #p1: Point
  #p2: Point
  #withDots: boolean
  #params: ArrowMarkerParams

  constructor(p1: Point, p2: Point, withDots: boolean, params: ArrowMarkerParams) {
    this.#p1 = p1
    this.#p2 = p2
    this.#withDots = withDots
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context
      const hpr = scope.horizontalPixelRatio
      const vpr = scope.verticalPixelRatio
      const pr = Math.min(hpr, vpr)

      // Work in logical pixel space for all geometry.
      const tailX = this.#p1.x
      const tailY = this.#p1.y
      const tipX = this.#p2.x
      const tipY = this.#p2.y

      let dx = tipX - tailX
      let dy = tipY - tailY
      const rawLen = Math.sqrt(dx * dx + dy * dy)
      if (rawLen === 0) return

      // Enforce minimum visual length of 22 logical px by moving the tail.
      const MIN_LEN = 22
      let adjTailX = tailX
      let adjTailY = tailY
      if (rawLen < MIN_LEN) {
        const inv = 1 / rawLen
        adjTailX = tipX - dx * inv * MIN_LEN
        adjTailY = tipY - dy * inv * MIN_LEN
        dx = tipX - adjTailX
        dy = tipY - adjTailY
      }

      const arrowLen = Math.max(rawLen, MIN_LEN)

      // Normalised axis and perpendicular vectors (in logical px space).
      // Perp = (i.y, -i.x).normalised() per TradingView — 90° clockwise from axis.
      const ux = dx / arrowLen
      const uy = dy / arrowLen
      const perpX = uy
      const perpY = -ux

      // Arrow geometry constants (in logical px).
      const t = headSize(arrowLen)
      const n = arrowLen >= 35 ? 0.1 : 0 // shoulder notch for longer arrows

      // Map local (along-axis, perp) → bitmap canvas coords.
      const toCanvas = (along: number, perp: number) => ({
        x: (adjTailX + ux * along + perpX * perp) * hpr,
        y: (adjTailY + uy * along + perpY * perp) * vpr
      })

      // Six path points (tail + upper half + tip + lower half):
      // upper shoulder, upper wing, tip, lower wing, lower shoulder
      const shoulder = arrowLen - t + t * n
      const shaftHalf = (1.22 * t) / 4
      const wingHalf = (1.22 * t) / 2

      const color = this.#params['line-color']
      ctx.fillStyle = color
      ctx.strokeStyle = color
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.lineWidth = strokeWidth(arrowLen) * pr

      const start = toCanvas(0, 0)
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(...Object.values(toCanvas(shoulder, shaftHalf)))
      ctx.lineTo(...Object.values(toCanvas(arrowLen - t, wingHalf)))
      ctx.lineTo(...Object.values(toCanvas(arrowLen, 0)))
      ctx.lineTo(...Object.values(toCanvas(arrowLen - t, -wingHalf)))
      ctx.lineTo(...Object.values(toCanvas(shoulder, -shaftHalf)))
      ctx.closePath()
      ctx.stroke()
      ctx.fill()

      if (this.#withDots) {
        dot(scope, this.#p1, { color })
        dot(scope, this.#p2, { color })
      }
    })
  }
}

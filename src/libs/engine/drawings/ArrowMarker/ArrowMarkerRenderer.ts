import { dot } from '@engine/primitives/dot'
import type { ArrowMarkerParams } from './ArrowMarker'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { Coordinate, IPrimitivePaneRenderer, Point } from 'lightweight-charts'

function headSize(len: number): number {
  return Math.max(Math.min(len * 0.55, 100), 10)
}
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

      const tailX = this.#p1.x
      const tailY = this.#p1.y
      const tipX = this.#p2.x
      const tipY = this.#p2.y

      let dx = tipX - tailX
      let dy = tipY - tailY
      const rawLen = Math.sqrt(dx * dx + dy * dy)
      if (rawLen === 0) return

      const MIN_LEN = 22
      let adjTailX = tailX
      let adjTailY = tailY
      if (rawLen < MIN_LEN) {
        const inv = 1 / rawLen
        adjTailX = (tipX - dx * inv * MIN_LEN) as Coordinate
        adjTailY = (tipY - dy * inv * MIN_LEN) as Coordinate
        dx = tipX - adjTailX
        dy = tipY - adjTailY
      }

      const arrowLen = Math.max(rawLen, MIN_LEN)

      const ux = dx / arrowLen
      const uy = dy / arrowLen
      const perpX = uy
      const perpY = -ux

      const t = headSize(arrowLen)
      const n = arrowLen >= 35 ? 0.1 : 0

      const toCanvas = (along: number, perp: number) => ({
        x: (adjTailX + ux * along + perpX * perp) * hpr,
        y: (adjTailY + uy * along + perpY * perp) * vpr
      })

      const shoulder = arrowLen - t + t * n
      const shaftHalf = (1.22 * t) / 4
      const wingHalf = (1.22 * t) / 2

      const color = this.#params['fill-color']
      ctx.fillStyle = color
      ctx.strokeStyle = color
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.lineWidth = strokeWidth(arrowLen) * pr

      const start = toCanvas(0, 0)
      const p1 = toCanvas(shoulder, shaftHalf)
      const p2 = toCanvas(arrowLen - t, wingHalf)
      const p3 = toCanvas(arrowLen, 0)
      const p4 = toCanvas(arrowLen - t, -wingHalf)
      const p5 = toCanvas(shoulder, -shaftHalf)
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.lineTo(p3.x, p3.y)
      ctx.lineTo(p4.x, p4.y)
      ctx.lineTo(p5.x, p5.y)
      ctx.closePath()
      ctx.stroke()
      ctx.fill()

      if (this.#params.text) {
        const ndx = (tipX - tailX) / rawLen
        const ndy = (tipY - tailY) / rawLen
        const GAP = 10

        const tAlign: CanvasTextAlign = Math.abs(ndx) >= Math.abs(ndy) ? (ndx > 0 ? 'right' : 'left') : 'center'
        const tBaseline: CanvasTextBaseline = Math.abs(ndy) >= Math.abs(ndx) ? (ndy > 0 ? 'bottom' : 'top') : 'middle'

        const textX = tailX + (tAlign === 'right' ? -GAP : tAlign === 'left' ? GAP : 0)
        const textY = tailY + (tBaseline === 'bottom' ? -GAP : tBaseline === 'top' ? GAP : 0)

        const fSize = this.#params['font-size'] * pr
        ctx.font = `${fSize}px sans-serif`
        ctx.fillStyle = this.#params['text-color']
        ctx.textAlign = tAlign
        ctx.textBaseline = tBaseline
        ctx.fillText(this.#params.text, textX * hpr, textY * vpr)
      }

      if (this.#withDots) {
        dot(scope, this.#p1)
        dot(scope, this.#p2)
      }
    })
  }
}

import type { BitmapCoordinatesRenderingScope } from 'fancy-canvas'
import type { Point } from 'lightweight-charts'

const ARROW_HEAD_LENGTH = 12
const ARROW_HEAD_WIDTH = 6

type Params = {
  color: string
}

export const arrowHead = (scope: BitmapCoordinatesRenderingScope, p1: Point, p2: Point, params: Params) => {
  const hpr = scope.horizontalPixelRatio
  const vpr = scope.verticalPixelRatio

  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return

  const ux = dx / len
  const uy = dy / len

  const tip = { x: p2.x * hpr, y: p2.y * vpr }
  const base = {
    x: (p2.x - ux * ARROW_HEAD_LENGTH) * hpr,
    y: (p2.y - uy * ARROW_HEAD_LENGTH) * vpr
  }
  const left = {
    x: base.x - uy * ARROW_HEAD_WIDTH * hpr,
    y: base.y + ux * ARROW_HEAD_WIDTH * vpr
  }
  const right = {
    x: base.x + uy * ARROW_HEAD_WIDTH * hpr,
    y: base.y - ux * ARROW_HEAD_WIDTH * vpr
  }

  const ctx = scope.context
  ctx.beginPath()
  ctx.moveTo(tip.x, tip.y)
  ctx.lineTo(left.x, left.y)
  ctx.lineTo(right.x, right.y)
  ctx.closePath()
  ctx.fillStyle = params.color
  ctx.fill()
}

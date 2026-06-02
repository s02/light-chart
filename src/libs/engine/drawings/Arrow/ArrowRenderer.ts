import type { ArrowParams } from '@engine/drawings/Arrow/Arrow'
import { dot } from '@engine/primitives/dot'
import { line } from '@engine/primitives/line'
import type { BitmapCoordinatesRenderingScope, CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

const ARROW_HEAD_LENGTH = 12
const ARROW_HEAD_WIDTH = 6

function drawArrowHead(scope: BitmapCoordinatesRenderingScope, p1: Point, p2: Point, color: string) {
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
  ctx.fillStyle = color
  ctx.fill()
}

export class ArrowRenderer implements IPrimitivePaneRenderer {
  #p1: Point
  #p2: Point
  #withDots: boolean
  #params: ArrowParams

  constructor(p1: Point, p2: Point, withDots: boolean, params: ArrowParams) {
    this.#p1 = p1
    this.#p2 = p2
    this.#withDots = withDots
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      line(scope, this.#p1, this.#p2, { width: this.#params['line-width'], color: this.#params['line-color'] })
      drawArrowHead(scope, this.#p1, this.#p2, this.#params['line-color'])

      if (this.#withDots) {
        dot(scope, this.#p1, { color: this.#params['line-color'] })
        dot(scope, this.#p2, { color: this.#params['line-color'] })
      }
    })
  }
}

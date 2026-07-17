import { type FibRetracementParams } from '@engine/drawings/FibRetracement/FibRetracement'
import { parseColor } from '@engine/helpers'
import { dot } from '@engine/primitives/dot'
import { line } from '@engine/primitives/line'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

const LABEL_PAD_X = 10
export class FibRetracementRenderer implements IPrimitivePaneRenderer {
  #p1: Point
  #p2: Point
  #withDots: boolean
  #params: FibRetracementParams
  #price1: number
  #price2: number

  constructor(p1: Point, p2: Point, withDots: boolean, params: FibRetracementParams, price1: number, price2: number) {
    this.#p1 = p1
    this.#p2 = p2
    this.#withDots = withDots
    this.#params = params
    this.#price1 = price1
    this.#price2 = price2
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const { context: ctx, horizontalPixelRatio: hpr, verticalPixelRatio: vpr } = scope
      const pr = Math.min(hpr, vpr)

      const minX = Math.min(this.#p1.x, this.#p2.x)
      const maxX = Math.max(this.#p1.x, this.#p2.x)

      const lw = this.#params['fr-line-width']
      const fontSize = this.#params['font-size'] * pr
      const trendColor = this.#params['fr-trend-line']

      const mm = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const
      const levels = mm
        .filter((level) => this.#params[`fr-c${level}-visible`])
        .map((level) => ({
          y: this.#p2.y + this.#params[`fr-c${level}-ratio`] * (this.#p1.y - this.#p2.y),
          price: this.#price2 + this.#params[`fr-c${level}-ratio`] * (this.#price1 - this.#price2),
          color: this.#params[`fr-c${level}-color`],
          label: this.#params[`fr-c${level}-ratio`]
        }))

      for (let i = 1; i < levels.length; i++) {
        ctx.fillStyle = levels[i].color
        const yTop = Math.min(levels[i - 1].y, levels[i].y) * vpr
        const yH = Math.abs(levels[i].y - levels[i - 1].y) * vpr
        ctx.fillRect(minX * hpr, yTop, (maxX - minX) * hpr, yH)
      }

      line(scope, this.#p1, this.#p2, { width: lw, color: trendColor, dash: [20, 20] })

      for (const level of levels) {
        line(scope, { x: minX, y: level.y } as Point, { x: maxX, y: level.y } as Point, {
          width: lw,
          color: parseColor(level.color).baseColor
        })
      }

      ctx.font = `${fontSize}px sans-serif`
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      for (const level of levels) {
        ctx.fillStyle = parseColor(level.color).baseColor
        ctx.fillText(`${level.label} (${level.price.toFixed(2)})`, (minX - LABEL_PAD_X) * hpr, level.y * vpr)
      }

      if (this.#withDots) {
        dot(scope, this.#p1)
        dot(scope, this.#p2)
      }
    })
  }
}

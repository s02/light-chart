import { FIB_LEVELS, type FibRetracementParams } from '@engine/drawings/FibRetracement/FibRetracement'
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

      const lw = 1
      const fontSize = this.#params['font-size'] * pr
      const trendColor = this.#params['trend-color']

      // p1 = anchor at level 1, p2 = anchor at level 0
      // levelY(r) = p2.y + r * (p1.y - p2.y)
      const levels = FIB_LEVELS.map(({ ratio, key, label }) => ({
        y: this.#p2.y + ratio * (this.#p1.y - this.#p2.y),
        price: this.#price2 + ratio * (this.#price1 - this.#price2),
        color: this.#params[key] as string,
        label
      }))

      // Fill bands between adjacent levels, bounded to anchor x-range
      ctx.fillStyle = this.#params['fill-color']
      for (let i = 1; i < levels.length; i++) {
        const yTop = Math.min(levels[i - 1].y, levels[i].y) * vpr
        const yH = Math.abs(levels[i].y - levels[i - 1].y) * vpr
        ctx.fillRect(minX * hpr, yTop, (maxX - minX) * hpr, yH)
      }

      // Dashed diagonal from anchor1 to anchor2
      line(scope, this.#p1, this.#p2, { width: lw, color: trendColor, dash: [5, 5] })

      // Horizontal level lines bounded to anchor x-range
      for (const level of levels) {
        line(scope, { x: minX, y: level.y } as Point, { x: maxX, y: level.y } as Point, {
          width: lw,
          color: level.color
        })
      }

      // Labels just to the left of minX, centered on the level line
      ctx.font = `${fontSize}px sans-serif`
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      for (const level of levels) {
        ctx.fillStyle = level.color
        ctx.fillText(`${level.label} (${level.price.toFixed(2)})`, (minX - LABEL_PAD_X) * hpr, level.y * vpr)
      }

      if (this.#withDots) {
        dot(scope, this.#p1, { color: trendColor })
        dot(scope, this.#p2, { color: trendColor })
      }
    })
  }
}

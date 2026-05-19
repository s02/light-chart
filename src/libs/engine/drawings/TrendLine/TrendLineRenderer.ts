import { circle } from '@engine/primitives/circle'
import { line } from '@engine/primitives/line'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

export class TrendLineRenderer implements IPrimitivePaneRenderer {
  #p1: Point
  #p2: Point
  #withDots: boolean

  constructor(p1: Point, p2: Point, withDots: boolean) {
    this.#p1 = p1
    this.#p2 = p2
    this.#withDots = withDots
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      line(scope, this.#p1, this.#p2, { width: 2, color: 'green' })

      if (this.#withDots) {
        circle(scope, this.#p1, { radius: 5, color: 'green', width: 2, fill: '#001B36' })
        circle(scope, this.#p2, { radius: 5, color: 'green', width: 2, fill: '#001B36' })
      }
    })
  }
}

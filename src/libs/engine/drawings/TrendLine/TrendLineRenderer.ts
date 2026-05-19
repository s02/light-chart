import { circle } from '@engine/primitives/circle'
import { line } from '@engine/primitives/line'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

export class TrendLineRenderer implements IPrimitivePaneRenderer {
  #p1: Point
  #p2: Point

  constructor(p1: Point, p2: Point) {
    this.#p1 = p1
    this.#p2 = p2
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      circle(scope, this.#p1, { radius: 3, fill: 'green' })
      line(scope, this.#p1, this.#p2, { width: 2, color: 'green' })
      circle(scope, this.#p2, { radius: 3, fill: 'green' })
    })
  }
}

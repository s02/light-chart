import type { TrendLineParams } from '@engine/drawings/TrendLine/TrendLine'
import { dot } from '@engine/primitives/dot'
import { line } from '@engine/primitives/line'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

export class TrendLineRenderer implements IPrimitivePaneRenderer {
  #p1: Point
  #p2: Point
  #withDots: boolean
  #params: TrendLineParams

  constructor(p1: Point, p2: Point, withDots: boolean, params: TrendLineParams) {
    this.#p1 = p1
    this.#p2 = p2
    this.#withDots = withDots
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      line(scope, this.#p1, this.#p2, { width: this.#params['line-width'], color: this.#params['line-color'] })

      if (this.#withDots) {
        dot(scope, this.#p1, { color: this.#params['line-color'] })
        dot(scope, this.#p2, { color: this.#params['line-color'] })
      }
    })
  }
}

import type { RectangleParams } from '@engine/drawings/Rectangle/Rectangle'
import { dot } from '@engine/primitives/dot'
import { rect } from '@engine/primitives/rect'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

export class RectangleRenderer implements IPrimitivePaneRenderer {
  #p1: Point
  #p2: Point
  #withDots: boolean
  #params: RectangleParams

  constructor(p1: Point, p2: Point, withDots: boolean, params: RectangleParams) {
    this.#p1 = p1
    this.#p2 = p2
    this.#withDots = withDots
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      rect(scope, this.#p1, this.#p2, this.#params)

      if (this.#withDots) {
        dot(scope, this.#p1)
        dot(scope, this.#p2)
      }
    })
  }
}

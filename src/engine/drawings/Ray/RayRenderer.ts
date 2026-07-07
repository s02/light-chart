import { dot } from '@engine/primitives/dot'
import { ray } from '@engine/primitives/ray'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'
import type { RayParams } from '@engine/drawings/Ray/Ray'

export class RayRenderer implements IPrimitivePaneRenderer {
  #p1: Point
  #p2: Point
  #withDots: boolean
  #params: RayParams

  constructor(p1: Point, p2: Point, withDots: boolean, params: RayParams) {
    this.#p1 = p1
    this.#p2 = p2
    this.#withDots = withDots
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      ray(scope, this.#p1, this.#p2, { width: this.#params['line-width'], color: this.#params['line-color'] })

      if (this.#withDots) {
        dot(scope, this.#p1)
        dot(scope, this.#p2)
      }
    })
  }
}

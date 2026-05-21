import { dot } from '@engine/primitives/dot'
import type { CircleParams } from '@engine/drawings/Circle/Circle'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'
import { circlep } from '@engine/primitives/circle'

export class CircleRenderer implements IPrimitivePaneRenderer {
  #p1: Point
  #p2: Point
  #withDots: boolean
  #params: CircleParams

  constructor(p1: Point, p2: Point, withDots: boolean, params: CircleParams) {
    this.#p1 = p1
    this.#p2 = p2
    this.#withDots = withDots
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      //line(scope, this.#p1, this.#p2, { width: this.#params.width, color: this.#params.color })
      circlep(scope, this.#p1, this.#p2, this.#params)

      if (this.#withDots) {
        dot(scope, this.#p1, { color: this.#params.color })
        dot(scope, this.#p2, { color: this.#params.color })
      }
    })
  }
}

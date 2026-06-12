import { dot } from '@engine/primitives/dot'
import { line } from '@engine/primitives/line'
import type { CrossParams } from '@engine/drawings/Cross/Cross'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

export class CrossRenderer implements IPrimitivePaneRenderer {
  #p: Point
  #withDots: boolean
  #params: CrossParams

  constructor(p: Point, withDots: boolean, params: CrossParams) {
    this.#p = p
    this.#withDots = withDots
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const { width, height } = scope.bitmapSize

      line(scope, { x: this.#p.x, y: 0 } as Point, { x: this.#p.x, y: height } as Point, {
        width: this.#params['line-width'],
        color: this.#params['line-color']
      })

      line(scope, { x: 0, y: this.#p.y } as Point, { x: width, y: this.#p.y } as Point, {
        width: this.#params['line-width'],
        color: this.#params['line-color']
      })

      if (this.#withDots) {
        dot(scope, this.#p, { color: this.#params['line-color'] })
      }
    })
  }
}

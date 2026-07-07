import type { PathParams } from '@engine/drawings/Path/Path'
import { arrowHead } from '@engine/primitives/arrow-head'
import { dot } from '@engine/primitives/dot'
import { line } from '@engine/primitives/line'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

export class PathRenderer implements IPrimitivePaneRenderer {
  #points: Point[]
  #withDots: boolean
  #params: PathParams

  constructor(points: Point[], withDots: boolean, params: PathParams) {
    this.#points = points
    this.#withDots = withDots
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      for (let i = 0; i < this.#points.length - 1; i++) {
        line(scope, this.#points[i], this.#points[i + 1], {
          width: this.#params['line-width'],
          color: this.#params['line-color']
        })
      }

      if (this.#points.length >= 2) {
        arrowHead(scope, this.#points[this.#points.length - 2], this.#points[this.#points.length - 1], {
          color: this.#params['line-color']
        })
      }

      if (this.#withDots) {
        this.#points.map((p) => dot(scope, p, { color: this.#params['line-color'] }))
      }
    })
  }
}

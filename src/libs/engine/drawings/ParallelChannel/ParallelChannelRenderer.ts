import { type ParallelChannelParams } from '@engine/drawings/ParallelChannel/ParallelChannel'
import { dot } from '@engine/primitives/dot'
import { line } from '@engine/primitives/line'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

export class ParallelChannelRenderer implements IPrimitivePaneRenderer {
  #points: Point[]
  #withDots: boolean
  #params: ParallelChannelParams

  constructor(points: Point[], withDots: boolean, params: ParallelChannelParams) {
    this.#points = points
    this.#withDots = withDots
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const color = this.#params['line-color']
      const width = this.#params['line-width']

      if (this.#points.length > 1) {
        line(scope, this.#points[0], this.#points[1], { color, width })
      }

      if (this.#points.length > 2) {
        line(scope, this.#points[2], this.#points[3], { color, width })
      }

      if (this.#withDots) {
        if (this.#points.length > 1) {
          dot(scope, this.#points[0], { color })
          dot(scope, this.#points[1], { color })
        }
        if (this.#points.length > 2) {
          dot(scope, this.#points[2], { color })
          dot(scope, this.#points[3], { color })
        }
      }
    })
  }
}

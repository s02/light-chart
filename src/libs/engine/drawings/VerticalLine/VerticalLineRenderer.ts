import { dot } from '@engine/primitives/dot'
import { line } from '@engine/primitives/line'
import type { VerticalLineParams } from '@engine/drawings/VerticalLine/VerticalLine'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

export class VerticalLineRenderer implements IPrimitivePaneRenderer {
  #p: Point
  #withDots: boolean
  #params: VerticalLineParams

  constructor(p: Point, withDots: boolean, params: VerticalLineParams) {
    this.#p = p
    this.#withDots = withDots
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      line(scope, { x: this.#p.x, y: 0 } as Point, { x: this.#p.x, y: scope.bitmapSize.height } as Point, {
        width: this.#params.width,
        color: this.#params.color
      })

      if (this.#withDots) {
        dot(scope, this.#p, { color: this.#params.color })
      }
    })
  }
}

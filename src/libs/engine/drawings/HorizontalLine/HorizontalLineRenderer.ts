import type { HorizontalLineParams } from '@engine/drawings/HorizontalLine/HorizontalLine'
import { dot } from '@engine/primitives/dot'
import { line } from '@engine/primitives/line'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

export class HorizontalLineRenderer implements IPrimitivePaneRenderer {
  #p: Point
  #withDots: boolean
  #params: HorizontalLineParams

  constructor(p: Point, withDots: boolean, params: HorizontalLineParams) {
    this.#p = p
    this.#withDots = withDots
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      line(scope, { x: 0, y: this.#p.y } as Point, { x: scope.bitmapSize.width, y: this.#p.y } as Point, {
        width: this.#params['line-width'],
        color: this.#params['line-color']
      })

      if (this.#withDots) {
        dot(scope, this.#p, { color: this.#params['line-color'] })
      }
    })
  }
}

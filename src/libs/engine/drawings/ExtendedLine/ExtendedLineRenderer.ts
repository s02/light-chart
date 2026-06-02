import type { ExtendedLineParams } from '@engine/drawings/ExtendedLine/ExtendedLine'
import { dot } from '@engine/primitives/dot'
import { extendedLine } from '@engine/primitives/extended-line'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

export class ExtendedLineRenderer implements IPrimitivePaneRenderer {
  #p1: Point
  #p2: Point
  #withDots: boolean
  #params: ExtendedLineParams

  constructor(p1: Point, p2: Point, withDots: boolean, params: ExtendedLineParams) {
    this.#p1 = p1
    this.#p2 = p2
    this.#withDots = withDots
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      extendedLine(scope, this.#p1, this.#p2, {
        width: this.#params['line-width'],
        color: this.#params['line-color']
      })

      if (this.#withDots) {
        dot(scope, this.#p1, { color: this.#params['line-color'] })
        dot(scope, this.#p2, { color: this.#params['line-color'] })
      }
    })
  }
}

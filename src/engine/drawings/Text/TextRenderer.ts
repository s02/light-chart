import { dot } from '@engine/primitives/dot'
import { textLabel } from '@engine/primitives/text-label'
import type { TextParams } from '@engine/drawings/Text/TextDrawing'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

export class TextRenderer implements IPrimitivePaneRenderer {
  #p: Point
  #withDot: boolean
  #params: TextParams

  constructor(p: Point, withDot: boolean, params: TextParams) {
    this.#p = p
    this.#withDot = withDot
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      textLabel(scope, this.#p, this.#params)

      if (this.#withDot) {
        dot(scope, this.#p)
      }
    })
  }
}

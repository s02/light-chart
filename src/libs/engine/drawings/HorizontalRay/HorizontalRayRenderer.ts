import type { HorizontalRayParams } from './HorizontalRay'
import { dot } from '@engine/primitives/dot'
import { ray } from '@engine/primitives/ray'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

export class HorizontalRayRenderer implements IPrimitivePaneRenderer {
  #p: Point
  #withDots: boolean
  #params: HorizontalRayParams

  constructor(p: Point, withDots: boolean, params: HorizontalRayParams) {
    this.#p = p
    this.#withDots = withDots
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const p2: Point = { x: this.#p.x + 1, y: this.#p.y } as Point
      ray(scope, this.#p, p2, { width: this.#params['line-width'], color: this.#params['line-color'] })

      if (this.#withDots) {
        dot(scope, this.#p)
      }
    })
  }
}

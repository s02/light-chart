import type { TrendLineParams } from '@engine/drawings/TrendLine/TrendLine'
import { circle } from '@engine/primitives/circle'
import { line } from '@engine/primitives/line'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

export class TrendLineRenderer implements IPrimitivePaneRenderer {
  #p1: Point
  #p2: Point
  #withAnchors: boolean
  #params: TrendLineParams

  constructor(p1: Point, p2: Point, withDots: boolean, params: TrendLineParams) {
    this.#p1 = p1
    this.#p2 = p2
    this.#withAnchors = withDots
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      line(scope, this.#p1, this.#p2, { width: this.#params.width, color: this.#params.color })

      if (this.#withAnchors) {
        circle(scope, this.#p1, { radius: 5, color: this.#params.color, width: 2, fill: '#001B36' })
        circle(scope, this.#p2, { radius: 5, color: this.#params.color, width: 2, fill: '#001B36' })
      }
    })
  }
}

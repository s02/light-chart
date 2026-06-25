import { dot } from '@engine/primitives/dot'
import { line } from '@engine/primitives/line'
import { rect } from '@engine/primitives/rect'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

type Params = {
  upColor: string
  downColor: string
}

export class RwRectangleRenderer implements IPrimitivePaneRenderer {
  #p0: Point
  #p1: Point
  #p2: Point
  #p3: Point
  #withDots: boolean
  #params: Params

  constructor(p0: Point, p1: Point, p2: Point, p3: Point, withDots: boolean, params: Params) {
    this.#p0 = p0
    this.#p1 = p1
    this.#p2 = p2
    this.#p3 = p3
    this.#withDots = withDots
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const left = this.#p0.x
      const right = this.#p3.x
      const top = this.#p1.y
      const mid = this.#p0.y
      const bottom = this.#p2.y

      const tl = { x: left, y: top } as Point
      const ml = { x: left, y: mid } as Point
      const mr = { x: right, y: mid } as Point
      const br = { x: right, y: bottom } as Point

      rect(scope, tl, mr, { fill: this.#params.upColor })
      rect(scope, ml, br, { fill: this.#params.downColor })
      line(scope, ml, mr, { width: 1, color: 'rgb(255 255 255 / 50%)' })

      if (this.#withDots) {
        dot(scope, this.#p0)
        dot(scope, this.#p1)
        dot(scope, this.#p2)
        dot(scope, this.#p3)
      }
    })
  }
}

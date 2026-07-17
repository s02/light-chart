import { dot } from '@engine/primitives/dot'
import { line } from '@engine/primitives/line'
import { GANN_DIVISIONS } from '@engine/drawings/GannSquare/constants'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'
import type { GannSquareParams } from '@engine/drawings/GannSquare/GannSquare'

const LEVELS = [0, 1, 2, 3, 4, 5] as const

export class GannSquareRenderer implements IPrimitivePaneRenderer {
  #p1: Point
  #p2: Point
  #withDots: boolean
  #params: GannSquareParams

  constructor(p1: Point, p2: Point, withDots: boolean, params: GannSquareParams) {
    this.#p1 = p1
    this.#p2 = p2
    this.#withDots = withDots
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    const { p1, p2 } = { p1: this.#p1, p2: this.#p2 }
    const width = this.#params['line-width']

    target.useBitmapCoordinateSpace((scope) => {
      const minX = Math.min(p1.x, p2.x)
      const maxX = Math.max(p1.x, p2.x)
      const minY = Math.min(p1.y, p2.y)
      const maxY = Math.max(p1.y, p2.y)

      for (const level of LEVELS) {
        if (!this.#params[`square-${level}-visible`]) continue

        const color = this.#params[`square-${level}-color`]
        const lineParams = { width, color }

        const x = minX + (maxX - minX) * (level / GANN_DIVISIONS)
        const y = minY + (maxY - minY) * (level / GANN_DIVISIONS)

        line(scope, { x, y: minY } as Point, { x, y: maxY } as Point, lineParams)
        line(scope, { x: minX, y } as Point, { x: maxX, y } as Point, lineParams)
      }

      if (this.#withDots) {
        dot(scope, p1)
        dot(scope, p2)
      }
    })
  }
}

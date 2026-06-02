import type { GannSquareParams } from '@engine/drawings/GannSquare/GannSquare'
import { dot } from '@engine/primitives/dot'
import { line } from '@engine/primitives/line'
import { rect } from '@engine/primitives/rect'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

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
    target.useBitmapCoordinateSpace((scope) => {
      const p1 = this.#p1
      const p2 = this.#p2
      const color = this.#params['line-color']
      const width = this.#params['line-width']
      const divisions = Math.max(1, Math.round(this.#params['divisions']))

      rect(scope, p1, p2, {
        'line-color': color,
        'line-width': width,
        fill: this.#params['fill']
      })

      const minX = Math.min(p1.x, p2.x)
      const maxX = Math.max(p1.x, p2.x)
      const minY = Math.min(p1.y, p2.y)
      const maxY = Math.max(p1.y, p2.y)

      const lineParams = { width, color, dash: [4, 4] }

      for (let i = 1; i < divisions; i++) {
        const x = minX + (maxX - minX) * (i / divisions)
        line(scope, { x, y: minY } as Point, { x, y: maxY } as Point, lineParams)
      }

      for (let i = 1; i < divisions; i++) {
        const y = minY + (maxY - minY) * (i / divisions)
        line(scope, { x: minX, y } as Point, { x: maxX, y } as Point, lineParams)
      }

      if (this.#withDots) {
        dot(scope, p1, { color })
        dot(scope, p2, { color })
      }
    })
  }
}

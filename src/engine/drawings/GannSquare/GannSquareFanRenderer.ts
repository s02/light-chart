import { line } from '@engine/primitives/line'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

export class GannSquareFanRenderer implements IPrimitivePaneRenderer {
  #p1: Point
  #p2: Point
  #lineWidth: number
  #lines: { rise: number; run: number; color: string }[]

  constructor(p1: Point, p2: Point, lineWidth: number, lines: { rise: number; run: number; color: string }[]) {
    this.#p1 = p1
    this.#p2 = p2
    this.#lineWidth = lineWidth
    this.#lines = lines
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const dx = this.#p2.x - this.#p1.x
      const dy = this.#p2.y - this.#p1.y

      for (const { rise, run, color } of this.#lines) {
        const t = Math.min(1 / run, 1 / rise)
        const end = { x: this.#p1.x + t * run * dx, y: this.#p1.y + t * rise * dy } as Point
        line(scope, this.#p1, end, { width: this.#lineWidth, color, dash: [] })
      }
    })
  }
}

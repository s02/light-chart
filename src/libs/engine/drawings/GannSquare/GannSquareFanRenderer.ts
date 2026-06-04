import { line } from '@engine/primitives/line'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

export class GannSquareFanRenderer implements IPrimitivePaneRenderer {
  #p1: Point
  #p2: Point
  #color: string
  #lineWidth: number

  constructor(p1: Point, p2: Point, color: string, lineWidth: number) {
    this.#p1 = p1
    this.#p2 = p2
    this.#color = color
    this.#lineWidth = lineWidth
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const dx = this.#p2.x - this.#p1.x
      const dy = this.#p2.y - this.#p1.y
      const fanLines: [number, number][] = [
        [2, 1],
        [1, 1],
        [1, 2]
      ]
      const params = { width: this.#lineWidth, color: this.#color, dash: [] as number[] }

      for (const [rise, run] of fanLines) {
        const t = Math.min(1 / run, 1 / rise)
        const end = { x: this.#p1.x + t * run * dx, y: this.#p1.y + t * rise * dy } as Point
        line(scope, this.#p1, end, params)
      }
    })
  }
}

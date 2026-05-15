import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

export class TrendLineRenderer implements IPrimitivePaneRenderer {
  #p1: Point
  #p2: Point

  constructor(p1: Point, p2: Point) {
    this.#p1 = p1
    this.#p2 = p2
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context
      const hpr = scope.horizontalPixelRatio
      const vpr = scope.verticalPixelRatio

      ctx.beginPath()
      ctx.moveTo(this.#p1.x * hpr, this.#p1.y * vpr)
      ctx.lineTo(this.#p2.x * hpr, this.#p2.y * vpr)
      ctx.strokeStyle = 'blue'
      ctx.lineWidth = 3
      ctx.stroke()
    })
  }
}

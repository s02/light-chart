import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { Coordinate, IPrimitivePaneRenderer } from 'lightweight-charts'

export class HorizontalLineRenderer implements IPrimitivePaneRenderer {
  #y: Coordinate

  constructor(y: Coordinate) {
    this.#y = y
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context
      const vpr = scope.verticalPixelRatio

      ctx.beginPath()
      ctx.moveTo(0, this.#y * vpr)
      ctx.lineTo(scope.bitmapSize.width, this.#y * vpr)
      ctx.strokeStyle = 'red'
      ctx.lineWidth = 2
      ctx.stroke()
    })
  }
}

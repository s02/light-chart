import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer } from 'lightweight-charts'

export class AxisHighlighterPaneRenderer implements IPrimitivePaneRenderer {
  #from: number
  #to: number
  #color: string
  #vertical: boolean

  constructor(from: number, to: number, color: string, vertical: boolean) {
    this.#from = from
    this.#to = to
    this.#color = color
    this.#vertical = vertical
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const { context: ctx } = scope
      ctx.fillStyle = this.#color

      if (this.#vertical) {
        const from = Math.round(this.#from * scope.verticalPixelRatio)
        const to = Math.round(this.#to * scope.verticalPixelRatio)
        ctx.fillRect(0, Math.min(from, to), scope.bitmapSize.width, Math.abs(to - from))
      } else {
        const from = Math.round(this.#from * scope.horizontalPixelRatio)
        const to = Math.round(this.#to * scope.horizontalPixelRatio)
        ctx.fillRect(Math.min(from, to), 0, Math.abs(to - from), scope.bitmapSize.height)
      }
    })
  }
}

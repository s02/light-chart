import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

const PAD = 6

export class GannSquareLabelsRenderer implements IPrimitivePaneRenderer {
  #p1: Point
  #p2: Point
  #color: string
  #fontSize: number
  #barCount: number | null
  #priceDiff: number

  constructor(p1: Point, p2: Point, color: string, fontSize: number, barCount: number | null, priceDiff: number) {
    this.#p1 = p1
    this.#p2 = p2
    this.#color = color
    this.#fontSize = fontSize
    this.#barCount = barCount
    this.#priceDiff = priceDiff
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const { context: ctx, horizontalPixelRatio: hpr, verticalPixelRatio: vpr } = scope
      const pr = Math.min(hpr, vpr)

      const maxX = Math.max(this.#p1.x, this.#p2.x)
      const maxY = Math.max(this.#p1.y, this.#p2.y)

      const padX = PAD * hpr
      const padY = PAD * vpr

      const drawCornerLabel = (corner: Point, text: string) => {
        const onRight = corner.x >= maxX
        const onBottom = corner.y >= maxY

        ctx.textAlign = onRight ? 'left' : 'right'
        ctx.textBaseline = onBottom ? 'top' : 'bottom'

        const x = corner.x * hpr + (onRight ? padX : -padX)
        const y = corner.y * vpr + (onBottom ? padY : -padY)

        ctx.fillText(text, x, y)
      }

      ctx.font = `${this.#fontSize * pr}px sans-serif`
      ctx.fillStyle = this.#color

      if (this.#barCount !== null) {
        drawCornerLabel({ x: this.#p2.x, y: this.#p1.y } as Point, this.#barCount.toString())
      }

      drawCornerLabel({ x: this.#p1.x, y: this.#p2.y } as Point, this.#priceDiff.toFixed(8))

      if (this.#barCount !== null && this.#barCount !== 0) {
        const ratio = Math.abs(this.#priceDiff) / this.#barCount
        drawCornerLabel(this.#p2, ratio.toFixed(8))
      }
    })
  }
}

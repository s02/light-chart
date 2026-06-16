import type { EmojiParams } from '@engine/drawings/EmojiDrawing/EmojiDrawing'
import { dot } from '@engine/primitives/dot'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

export class EmojiRenderer implements IPrimitivePaneRenderer {
  #center: Point
  #edge: Point
  #withDots: boolean
  #params: EmojiParams
  #image: HTMLImageElement | null
  #rotation: number

  constructor(
    center: Point,
    edge: Point,
    withDots: boolean,
    params: EmojiParams,
    image: HTMLImageElement | null,
    rotation: number
  ) {
    this.#center = center
    this.#edge = edge
    this.#withDots = withDots
    this.#params = params
    this.#image = image
    this.#rotation = rotation
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const { context: ctx, horizontalPixelRatio: hpr, verticalPixelRatio: vpr } = scope
      const pr = Math.min(hpr, vpr)

      const dx = this.#edge.x - this.#center.x
      const dy = this.#edge.y - this.#center.y
      const radius = Math.sqrt(dx * dx + dy * dy)
      const halfSize = Math.max(radius * pr, 4)
      const angle = this.#rotation * (Math.PI / 180)

      ctx.save()
      ctx.translate(this.#center.x * hpr, this.#center.y * vpr)
      ctx.rotate(angle)

      if (this.#withDots) {
        ctx.save()
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.8)'
        ctx.lineWidth = 1 * pr
        ctx.strokeRect(-halfSize, -halfSize, halfSize * 2, halfSize * 2)
        ctx.restore()
      }

      if (this.#image) {
        ctx.drawImage(this.#image, -halfSize, -halfSize, halfSize * 2, halfSize * 2)
      } else {
        ctx.font = `${halfSize * 2}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(this.#params.emoji, 0, 0)
      }

      ctx.restore()

      if (this.#withDots) {
        dot(scope, this.#center, { color: '#888' })
        dot(scope, this.#edge, { color: '#888' })
      }
    })
  }
}

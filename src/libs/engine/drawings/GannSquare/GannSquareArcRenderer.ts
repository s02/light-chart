import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

export class GannSquareArcRenderer implements IPrimitivePaneRenderer {
  #p1: Point
  #p2: Point
  #divisions: number
  #color: string
  #lineWidth: number
  #arcs: { x: number; y: number }[]

  constructor(
    p1: Point,
    p2: Point,
    divisions: number,
    color: string,
    lineWidth: number,
    arcs: { x: number; y: number }[]
  ) {
    this.#p1 = p1
    this.#p2 = p2
    this.#divisions = divisions
    this.#color = color
    this.#lineWidth = lineWidth
    this.#arcs = arcs
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context
      const hpr = scope.horizontalPixelRatio
      const vpr = scope.verticalPixelRatio

      const boxW = Math.abs(this.#p2.x - this.#p1.x) * hpr
      const boxH = Math.abs(this.#p2.y - this.#p1.y) * vpr
      const s = boxH / boxW
      const signX = Math.sign(this.#p2.x - this.#p1.x) || 1
      const signY = Math.sign(this.#p2.y - this.#p1.y) || 1

      const minX = Math.min(this.#p1.x, this.#p2.x)
      const minY = Math.min(this.#p1.y, this.#p2.y)

      ctx.save()
      ctx.beginPath()
      ctx.rect(minX * hpr, minY * vpr, boxW, boxH)
      ctx.clip()

      ctx.strokeStyle = this.#color
      ctx.lineWidth = this.#lineWidth
      ctx.setLineDash([])

      for (const arc of this.#arcs) {
        const px = (arc.x / this.#divisions) * boxW
        const py = (arc.y / this.#divisions) * boxH
        const a = Math.sqrt(px * px + (py / s) * (py / s))

        ctx.save()
        ctx.translate(this.#p1.x * hpr, this.#p1.y * vpr)
        ctx.scale(signX, signY * s)
        ctx.beginPath()
        ctx.arc(0, 0, a, 0, Math.PI / 2)
        ctx.scale(signX, signY / s)
        ctx.stroke()
        ctx.restore()
      }

      ctx.restore()
    })
  }
}

import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer } from 'lightweight-charts'

export class GannSquareArcRenderer implements IPrimitivePaneRenderer {
  #minX: number
  #minY: number
  #maxX: number
  #maxY: number
  #divisions: number
  #color: string
  #lineWidth: number
  #arcs: { x: number; y: number }[]

  constructor(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    divisions: number,
    color: string,
    lineWidth: number,
    arcs: { x: number; y: number }[]
  ) {
    this.#minX = minX
    this.#minY = minY
    this.#maxX = maxX
    this.#maxY = maxY
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

      const boxW = (this.#maxX - this.#minX) * hpr
      const boxH = (this.#maxY - this.#minY) * vpr
      const s = boxH / boxW

      ctx.save()
      ctx.beginPath()
      ctx.rect(this.#minX * hpr, this.#minY * vpr, boxW, boxH)
      ctx.clip()

      ctx.strokeStyle = this.#color
      ctx.lineWidth = this.#lineWidth
      ctx.setLineDash([])

      for (const arc of this.#arcs) {
        const px = (arc.x / this.#divisions) * boxW
        const py = (arc.y / this.#divisions) * boxH
        const a = Math.sqrt(px * px + (py / s) * (py / s))

        ctx.save()
        ctx.translate(this.#minX * hpr, this.#minY * vpr)
        ctx.scale(1, s)
        ctx.beginPath()
        ctx.arc(0, 0, a, 0, Math.PI / 2)
        ctx.scale(1, 1 / s)
        ctx.stroke()
        ctx.restore()
      }

      ctx.restore()
    })
  }
}

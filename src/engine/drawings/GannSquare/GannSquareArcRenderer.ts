import { GANN_DIVISIONS } from '@engine/drawings/GannSquare/constants'
import { parseColor } from '@engine/helpers'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

export class GannSquareArcRenderer implements IPrimitivePaneRenderer {
  #p1: Point
  #p2: Point
  #lineWidth: number
  #arcs: { x: number; y: number; color: string }[]

  constructor(p1: Point, p2: Point, lineWidth: number, arcs: { x: number; y: number; color: string }[]) {
    this.#p1 = p1
    this.#p2 = p2
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

      const radii = this.#arcs.map((arc) => {
        const px = (arc.x / GANN_DIVISIONS) * boxW
        const py = (arc.y / GANN_DIVISIONS) * boxH

        return {
          value: Math.sqrt(px * px + (py / s) * (py / s)),
          color: arc.color
        }
      })

      for (let i = 0; i < radii.length; i++) {
        const rHigh = radii[i].value
        const rLow = i > 0 ? radii[i - 1].value : 0
        const fillColor = radii[i].color
        if (!fillColor || rHigh <= rLow) continue

        ctx.save()
        ctx.translate(this.#p1.x * hpr, this.#p1.y * vpr)
        ctx.scale(signX, signY * s)
        ctx.beginPath()
        ctx.moveTo(rHigh, 0)
        ctx.arc(0, 0, rHigh, 0, Math.PI / 2)
        ctx.lineTo(0, rLow)
        if (rLow > 0) {
          ctx.arc(0, 0, rLow, Math.PI / 2, 0, true)
        }
        ctx.closePath()
        ctx.fillStyle = fillColor
        ctx.fill()
        ctx.restore()
      }

      ctx.lineWidth = this.#lineWidth
      ctx.setLineDash([])

      for (let i = 0; i < radii.length; i++) {
        const color = radii[i].color
        ctx.strokeStyle = color ? parseColor(color).baseColor : '#000'

        ctx.save()
        ctx.translate(this.#p1.x * hpr, this.#p1.y * vpr)
        ctx.scale(signX, signY * s)
        ctx.beginPath()
        ctx.arc(0, 0, radii[i].value, 0, Math.PI / 2)
        ctx.scale(signX, signY / s)
        ctx.stroke()
        ctx.restore()
      }

      ctx.restore()
    })
  }
}

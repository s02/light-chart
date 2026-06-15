import type { ArrowMarkLeftParams } from '@engine/drawings/ArrowMarkLeft/ArrowMarkLeft'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

export const ArrowHeadWidth = 19.5
export const ArrowHeadHeight = 12
export const ArrowTailWidth = 10
export const ArrowTailHeight = 10

export class ArrowMarkLeftRenderer implements IPrimitivePaneRenderer {
  #p: Point
  #params: ArrowMarkLeftParams

  constructor(p: Point, params: ArrowMarkLeftParams) {
    this.#p = p
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const { context: ctx, horizontalPixelRatio: hpr, verticalPixelRatio: vpr } = scope
      const pr = Math.min(hpr, vpr)

      const px = this.#p.x * hpr
      const py = this.#p.y * vpr
      const totalW = (ArrowHeadHeight + ArrowTailHeight) * hpr
      const tailL = ArrowTailHeight * hpr
      const headHalfH = (ArrowHeadWidth / 2) * vpr
      const tailH = (ArrowTailWidth / 2) * vpr

      const tip = px - totalW
      const shoulder = px - tailL

      ctx.beginPath()
      ctx.moveTo(tip, py)
      ctx.lineTo(shoulder, py - headHalfH)
      ctx.lineTo(shoulder, py - tailH)
      ctx.lineTo(px, py - tailH)
      ctx.lineTo(px, py + tailH)
      ctx.lineTo(shoulder, py + tailH)
      ctx.lineTo(shoulder, py + headHalfH)
      ctx.closePath()

      ctx.fillStyle = this.#params.fill
      ctx.fill('evenodd')

      const fontSize = this.#params['font-size'] * pr
      const paddingH = 4 * vpr
      const paddingW = 6 * hpr
      const gap = 2 * hpr

      ctx.font = `${fontSize}px sans-serif`
      const boxH = fontSize + paddingH * 2

      const bx = px + gap
      const by = py - boxH / 2

      ctx.fillStyle = this.#params['text-color']
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText(this.#params.textarea, bx + paddingW, by + paddingH)
    })
  }
}

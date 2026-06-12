import type { ArrowMarkUpParams } from '@engine/drawings/ArrowMarkUp/ArrowMarkUp'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

export const ArrowHeadWidth = 19.5
export const ArrowHeadHeight = 12
export const ArrowTailWidth = 10
export const ArrowTailHeight = 10

export class ArrowMarkUpRenderer implements IPrimitivePaneRenderer {
  #p: Point
  #params: ArrowMarkUpParams

  constructor(p: Point, params: ArrowMarkUpParams) {
    this.#p = p
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const { context: ctx, horizontalPixelRatio: hpr, verticalPixelRatio: vpr } = scope
      const pr = Math.min(hpr, vpr)

      const px = this.#p.x * hpr
      const py = this.#p.y * vpr
      const totalH = (ArrowHeadHeight + ArrowTailHeight) * vpr
      const tailH = ArrowTailHeight * vpr
      const headHalfW = (ArrowHeadWidth / 2) * hpr
      const tailW = (ArrowTailWidth / 2) * hpr

      const tip = py - totalH
      const shoulder = py - tailH

      ctx.beginPath()
      ctx.moveTo(px, tip)
      ctx.lineTo(px + headHalfW, shoulder)
      ctx.lineTo(px + tailW, shoulder)
      ctx.lineTo(px + tailW, py)
      ctx.lineTo(px - tailW, py)
      ctx.lineTo(px - tailW, shoulder)
      ctx.lineTo(px - headHalfW, shoulder)
      ctx.closePath()

      ctx.fillStyle = this.#params.fill
      ctx.fill('evenodd')

      const fontSize = this.#params['font-size'] * pr
      const paddingH = 4 * vpr
      const paddingW = 6 * hpr
      const gap = 2 * vpr

      ctx.font = `${fontSize}px sans-serif`
      const textWidth = ctx.measureText(this.#params.text).width
      const boxW = textWidth + paddingW * 2

      const bx = px - boxW / 2
      const by = py + gap

      ctx.fillStyle = this.#params['text-color']
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText(this.#params.text, bx + paddingW, by + paddingH)
    })
  }
}

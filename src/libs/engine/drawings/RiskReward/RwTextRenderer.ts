import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

type Params = {
  color?: string
  fill?: string
  fontSize?: number
  paddingW?: number
  paddingH?: number
  lineGap?: number
  stroke?: string
  origin?: 'top' | 'bottom'
}

const defaultParams: Params = {
  color: 'rgb(0 0 0)',
  fill: 'rgb(255 255 255 / 20%)',
  fontSize: 12,
  paddingW: 6,
  paddingH: 4,
  lineGap: 4,
  stroke: 'rgb(255 255 255 / 0%)',
  origin: 'top'
}

export class RwTextRenderer implements IPrimitivePaneRenderer {
  #text: string[]
  #point: Point
  #params: Required<Params>

  constructor(text: string[], point: Point, params?: Params) {
    this.#text = text
    this.#point = point
    this.#params = {
      ...defaultParams,
      ...(params || {})
    } as Required<Params>
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const { context: ctx, horizontalPixelRatio: hpr, verticalPixelRatio: vpr } = scope

      const pr = Math.min(hpr, vpr)
      const fontSize = this.#params.fontSize * pr
      const paddingW = this.#params.paddingW * hpr
      const paddingH = this.#params.paddingH * vpr
      const lineGap = this.#params.lineGap * vpr

      ctx.font = `${fontSize}px sans-serif`

      const boxW = Math.max(...this.#text.map((text) => ctx.measureText(text).width)) + paddingW * 2
      const boxH = fontSize * this.#text.length + paddingH * 2 + lineGap * (this.#text.length - 1)

      const radius = 3 * Math.min(hpr, vpr)
      const bx = this.#point.x * hpr - boxW / 2
      const by = this.#params.origin === 'top' ? this.#point.y * vpr : this.#point.y * vpr - boxH

      ctx.beginPath()
      ctx.moveTo(bx + radius, by)
      ctx.lineTo(bx + boxW - radius, by)
      ctx.arcTo(bx + boxW, by, bx + boxW, by + radius, radius)
      ctx.lineTo(bx + boxW, by + boxH - radius)
      ctx.arcTo(bx + boxW, by + boxH, bx + boxW - radius, by + boxH, radius)
      ctx.lineTo(bx + radius, by + boxH)
      ctx.arcTo(bx, by + boxH, bx, by + boxH - radius, radius)
      ctx.lineTo(bx, by + radius)
      ctx.arcTo(bx, by, bx + radius, by, radius)
      ctx.closePath()
      ctx.fillStyle = this.#params.fill
      ctx.fill()
      ctx.strokeStyle = this.#params.stroke
      ctx.lineWidth = 1 * Math.min(hpr, vpr)
      ctx.stroke()

      ctx.fillStyle = this.#params.color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      for (let i = 0; i < this.#text.length; i++) {
        if (i === 0) {
          ctx.fillText(this.#text[0], bx + boxW / 2, by + paddingH)
        } else {
          ctx.fillText(this.#text[1], bx + boxW / 2, by + paddingH + fontSize + lineGap)
        }
      }
    })
  }
}

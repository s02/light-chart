import { dot } from '@engine/primitives/dot'
import type { SignPostParams } from './SignPost'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }

  if (current) lines.push(current)
  return lines.length > 0 ? lines : ['']
}

export class SignPostRenderer implements IPrimitivePaneRenderer {
  #p: Point
  #withDot: boolean
  #params: SignPostParams
  #barHighY: number
  #barLowY: number

  constructor(p: Point, withDot: boolean, params: SignPostParams, barHighY: number, barLowY: number) {
    this.#p = p
    this.#withDot = withDot
    this.#params = params
    this.#barHighY = barHighY
    this.#barLowY = barLowY
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context
      const hpr = scope.horizontalPixelRatio
      const vpr = scope.verticalPixelRatio
      const pr = Math.min(hpr, vpr)

      const fill = this.#params['fill-color']
      const fontSize = this.#params['font-size'] * pr
      const paddingH = 4 * vpr
      const paddingW = 6 * hpr
      const radius = 3 * pr
      const maxBoxWidth = 250 * hpr

      ctx.font = `${fontSize}px sans-serif`

      const lines = wrapText(ctx, this.#params.text, maxBoxWidth - paddingW * 2)
      const maxLineWidth = Math.max(...lines.map((l) => ctx.measureText(l).width))
      const boxWidth = Math.min(maxLineWidth + paddingW * 2, maxBoxWidth)
      const boxHeight = fontSize * lines.length + paddingH * 2

      // Anchor in bitmap coords
      const ax = this.#p.x * hpr
      const ay = this.#p.y * vpr

      // Bar edges in bitmap coords
      const barHighY = this.#barHighY * vpr
      const barLowY = this.#barLowY * vpr
      const gap = 5 * vpr

      // Anchor sits on the bubble border nearest to the bar
      const bx = ax - boxWidth / 2
      let by: number
      if (this.#p.y < this.#barHighY) {
        // Anchor above bar → anchor at bottom border of bubble
        by = ay - boxHeight
      } else if (this.#p.y > this.#barLowY) {
        // Anchor below bar → anchor at top border of bubble
        by = ay
      } else {
        // Anchor inside bar range → center bubble
        by = ay - boxHeight / 2
      }

      // Draw line from anchor to bar edge
      ctx.strokeStyle = fill
      ctx.lineWidth = this.#params['line-width'] * pr

      if (this.#p.y < this.#barHighY) {
        const lineEndY = barHighY - gap
        if (lineEndY > ay) {
          ctx.beginPath()
          ctx.moveTo(ax, ay)
          ctx.lineTo(ax, lineEndY)
          ctx.stroke()
        }
      } else if (this.#p.y > this.#barLowY) {
        const lineEndY = barLowY + gap
        if (lineEndY < ay) {
          ctx.beginPath()
          ctx.moveTo(ax, ay)
          ctx.lineTo(ax, lineEndY)
          ctx.stroke()
        }
      }

      // Draw bubble
      ctx.beginPath()
      ctx.moveTo(bx + radius, by)
      ctx.lineTo(bx + boxWidth - radius, by)
      ctx.arcTo(bx + boxWidth, by, bx + boxWidth, by + radius, radius)
      ctx.lineTo(bx + boxWidth, by + boxHeight - radius)
      ctx.arcTo(bx + boxWidth, by + boxHeight, bx + boxWidth - radius, by + boxHeight, radius)
      ctx.lineTo(bx + radius, by + boxHeight)
      ctx.arcTo(bx, by + boxHeight, bx, by + boxHeight - radius, radius)
      ctx.lineTo(bx, by + radius)
      ctx.arcTo(bx, by, bx + radius, by, radius)
      ctx.closePath()
      ctx.fillStyle = fill
      ctx.fill()

      // Draw wrapped text
      ctx.fillStyle = this.#params['text-color']
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], bx + paddingW, by + paddingH + i * fontSize)
      }

      if (this.#withDot) {
        dot(scope, this.#p, { color: fill })
      }
    })
  }
}

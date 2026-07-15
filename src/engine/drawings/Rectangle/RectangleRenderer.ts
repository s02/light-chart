import type { RectangleParams } from '@engine/drawings/Rectangle/Rectangle'
import { dot } from '@engine/primitives/dot'
import { rect } from '@engine/primitives/rect'
import { lineDash } from '@engine/primitives/line-style'
import type { BitmapCoordinatesRenderingScope, CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

const TEXT_PADDING = 3

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const lines: string[] = []

  for (const paragraph of text.split('\n')) {
    let line = ''

    for (const word of paragraph.split(' ')) {
      const candidate = line ? `${line} ${word}` : word

      if (!line || ctx.measureText(candidate).width <= maxWidth) {
        line = candidate
        continue
      }

      lines.push(line)

      if (ctx.measureText(word).width <= maxWidth) {
        line = word
        continue
      }

      let chunk = ''
      for (const char of word) {
        const next = chunk + char
        if (chunk && ctx.measureText(next).width > maxWidth) {
          lines.push(chunk)
          chunk = char
        } else {
          chunk = next
        }
      }
      line = chunk
    }

    lines.push(line)
  }

  return lines
}

export class RectangleRenderer implements IPrimitivePaneRenderer {
  #p1: Point
  #p2: Point
  #withDots: boolean
  #params: RectangleParams

  constructor(p1: Point, p2: Point, withDots: boolean, params: RectangleParams) {
    this.#p1 = p1
    this.#p2 = p2
    this.#withDots = withDots
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      rect(scope, this.#p1, this.#p2, {
        ...this.#params,
        ...lineDash(this.#params['line-style'], this.#params['line-width'])
      })

      if (this.#params.text) {
        this.#drawText(scope)
      }

      if (this.#withDots) {
        dot(scope, this.#p1)
        dot(scope, this.#p2)
      }
    })
  }

  #drawText(scope: BitmapCoordinatesRenderingScope) {
    const ctx = scope.context
    const hpr = scope.horizontalPixelRatio
    const vpr = scope.verticalPixelRatio
    const pr = Math.min(hpr, vpr)

    const x = Math.min(this.#p1.x, this.#p2.x) * hpr
    const y = Math.min(this.#p1.y, this.#p2.y) * vpr
    const w = Math.abs(this.#p2.x - this.#p1.x) * hpr
    const h = Math.abs(this.#p2.y - this.#p1.y) * vpr

    const paddingX = TEXT_PADDING * hpr
    const paddingY = TEXT_PADDING * vpr
    const innerW = w - paddingX * 2
    const innerH = h - paddingY * 2

    if (innerW <= 0 || innerH <= 0) {
      return
    }

    const fontSize = this.#params['font-size'] * pr
    const lineHeight = fontSize * 1.2

    ctx.save()
    ctx.beginPath()
    ctx.rect(x + paddingX, y + paddingY, innerW, innerH)
    ctx.clip()

    ctx.font = `${fontSize}px sans-serif`
    ctx.fillStyle = this.#params['text-color']
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const lines = wrapText(ctx, this.#params.text, innerW)
    const centerX = x + w / 2
    const startY = y + h / 2 - ((lines.length - 1) * lineHeight) / 2

    lines.forEach((line, i) => {
      ctx.fillText(line, centerX, startY + i * lineHeight)
    })

    ctx.restore()
  }
}

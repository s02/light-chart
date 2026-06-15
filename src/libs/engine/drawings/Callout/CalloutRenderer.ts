import { dot } from '@engine/primitives/dot'
import type { CalloutParams } from './Callout'
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

export class CalloutRenderer implements IPrimitivePaneRenderer {
  #tip: Point
  #bubble: Point
  #withDots: boolean
  #params: CalloutParams

  constructor(tip: Point, bubble: Point, withDots: boolean, params: CalloutParams) {
    this.#tip = tip
    this.#bubble = bubble
    this.#withDots = withDots
    this.#params = params
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context
      const hpr = scope.horizontalPixelRatio
      const vpr = scope.verticalPixelRatio
      const pr = Math.min(hpr, vpr)

      const fill = this.#params.fill
      const fontSize = this.#params['font-size'] * pr
      const PAD = 10 * pr // padding on all sides
      const R = 8 * pr // corner radius
      const T = 8 * pr // tail base half-width offset from edge center
      const maxBoxWidth = 250 * hpr

      ctx.font = `${fontSize}px sans-serif`

      const lines = wrapText(ctx, this.#params.textarea, maxBoxWidth - 2 * PAD)
      const textW = Math.max(...lines.map((ln) => ctx.measureText(ln).width))
      const textH = fontSize * lines.length

      // Box dimensions in bitmap coords
      const a = Math.min(textW, maxBoxWidth - 2 * PAD) + 2 * PAD
      const l = textH + 2 * PAD

      // Box top-left (bubble anchor is box center)
      const d = this.#bubble.x * hpr - a / 2
      const h = this.#bubble.y * vpr - l / 2

      // Tip in LOCAL coords (origin = box top-left)
      const tx = this.#tip.x * hpr - d
      const ty = this.#tip.y * vpr - h

      // Box center in local coords
      const ix = a / 2
      const iy = l / 2

      // Determine which of 9 regions the tip is in.
      // c encodes: 0/10/20 = left/inside/right of box,  +0/+1/+2 = above/inside/below box.
      let c = 0
      if (tx > a) c = 20
      else if (tx > 0) c = 10

      if (ty > l) c += 2
      else if (ty > 0) c += 1

      // Whether the box is wide/tall enough to draw tail with ±T offset from center
      const u = a > 2 * R + 2 * T
      const g = l > 2 * R + 2 * T

      ctx.save()
      ctx.translate(d, h)

      ctx.beginPath()
      ctx.moveTo(R, 0)

      // ── Top edge (left→right) ──────────────────────────────────────────────
      if (c === 10) {
        if (u) {
          ctx.lineTo(ix - T, 0)
          ctx.lineTo(tx, ty)
          ctx.lineTo(ix + T, 0)
        } else {
          ctx.lineTo(tx, ty)
        }
      }
      ctx.lineTo(a - R, 0)

      // ── Top-right corner ──────────────────────────────────────────────────
      if (c === 20) {
        ctx.lineTo(tx, ty)
        ctx.lineTo(a, R)
      } else {
        ctx.arcTo(a, 0, a, R, R)
      }

      // ── Right edge (top→bottom) ───────────────────────────────────────────
      if (c === 21) {
        if (g) {
          ctx.lineTo(a, iy - T)
          ctx.lineTo(tx, ty)
          ctx.lineTo(a, iy + T)
        } else {
          ctx.lineTo(tx, ty)
        }
      }
      ctx.lineTo(a, l - R)

      // ── Bottom-right corner ───────────────────────────────────────────────
      if (c === 22) {
        ctx.lineTo(tx, ty)
        ctx.lineTo(a - R, l)
      } else {
        ctx.arcTo(a, l, a - R, l, R)
      }

      // ── Bottom edge (right→left) ──────────────────────────────────────────
      if (c === 12) {
        if (u) {
          ctx.lineTo(ix + T, l)
          ctx.lineTo(tx, ty)
          ctx.lineTo(ix - T, l)
        } else {
          ctx.lineTo(tx, ty)
        }
      }
      ctx.lineTo(R, l)

      // ── Bottom-left corner ────────────────────────────────────────────────
      if (c === 2) {
        ctx.lineTo(tx, ty)
        ctx.lineTo(0, l - R)
      } else {
        ctx.arcTo(0, l, 0, l - R, R)
      }

      // ── Left edge (bottom→top) ────────────────────────────────────────────
      if (c === 1) {
        if (g) {
          ctx.lineTo(0, iy + T)
          ctx.lineTo(tx, ty)
          ctx.lineTo(0, iy - T)
        } else {
          ctx.lineTo(tx, ty)
        }
      }
      ctx.lineTo(0, R)

      // ── Top-left corner ───────────────────────────────────────────────────
      if (c === 0) {
        ctx.lineTo(tx, ty)
        ctx.lineTo(R, 0)
      } else {
        ctx.arcTo(0, 0, R, 0, R)
      }

      ctx.closePath()
      ctx.fillStyle = fill
      ctx.fill()

      // ── Text ──────────────────────────────────────────────────────────────
      ctx.fillStyle = this.#params['text-color']
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], PAD, PAD + i * fontSize)
      }

      ctx.restore()

      if (this.#withDots) {
        dot(scope, this.#tip, { color: fill })
        dot(scope, this.#bubble, { color: fill })
      }
    })
  }
}

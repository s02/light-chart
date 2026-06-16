import type { PriceRangeParams } from '@engine/drawings/PriceRange/PriceRange'
import { arrowHead } from '@engine/primitives/arrow-head'
import { dot } from '@engine/primitives/dot'
import { line } from '@engine/primitives/line'
import { rect } from '@engine/primitives/rect'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'

const ARROW_THRESHOLD_MULTIPLIER = 25

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return m ? `${h}h ${m}m` : `${h}h`
  }
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  return h ? `${d}d ${h}h` : `${d}d`
}

export class PriceRangeRenderer implements IPrimitivePaneRenderer {
  #p1: Point
  #p2: Point
  #withDots: boolean
  #params: PriceRangeParams
  #price1: number
  #price2: number
  #barCount: number | null
  #timeDiff: number | null

  constructor(
    p1: Point,
    p2: Point,
    withDots: boolean,
    params: PriceRangeParams,
    price1: number,
    price2: number,
    barCount: number | null,
    timeDiff: number | null
  ) {
    this.#p1 = p1
    this.#p2 = p2
    this.#withDots = withDots
    this.#params = params
    this.#price1 = price1
    this.#price2 = price2
    this.#barCount = barCount
    this.#timeDiff = timeDiff
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const { context: ctx, horizontalPixelRatio: hpr, verticalPixelRatio: vpr } = scope
      const pr = Math.min(hpr, vpr)

      const minX = Math.min(this.#p1.x, this.#p2.x)
      const maxX = Math.max(this.#p1.x, this.#p2.x)
      const minY = Math.min(this.#p1.y, this.#p2.y)
      const maxY = Math.max(this.#p1.y, this.#p2.y)
      const midX = (minX + maxX) / 2
      const midY = (minY + maxY) / 2

      // Background fill
      rect(scope, { x: minX, y: minY } as Point, { x: maxX, y: maxY } as Point, {
        fill: this.#params.fill
      })

      // Border
      rect(scope, { x: minX, y: minY } as Point, { x: maxX, y: maxY } as Point, {
        'line-color': this.#params['border-color'],
        'line-width': this.#params['border-width']
      })

      const bw = this.#params['border-width'] / 2
      const lw = this.#params['line-width']

      // Horizontal distance line at vertical midpoint
      const hStart = { x: minX + bw, y: midY } as Point
      const hEnd = { x: maxX - bw, y: midY } as Point
      line(scope, hStart, hEnd, { width: lw, color: this.#params['line-color'] })
      if (maxX - minX >= ARROW_THRESHOLD_MULTIPLIER * lw) {
        arrowHead(scope, hStart, hEnd, { color: this.#params['line-color'] })
      }

      // Vertical price line at horizontal midpoint — arrow points toward p2
      const vStart = { x: midX, y: minY + bw } as Point
      const vEnd = { x: midX, y: maxY - bw } as Point
      line(scope, vStart, vEnd, { width: lw, color: this.#params['line-color'] })
      if (maxY - minY >= ARROW_THRESHOLD_MULTIPLIER * lw) {
        const [vFrom, vTo] = this.#p2.y > this.#p1.y ? [vStart, vEnd] : [vEnd, vStart]
        arrowHead(scope, vFrom, vTo, { color: this.#params['line-color'] })
      }

      // Label lines
      const priceDiff = this.#price2 - this.#price1
      const pctChange = (100 * priceDiff) / Math.abs(this.#price1)
      const sign = priceDiff >= 0 ? '+' : ''
      const line1 = `${sign}${priceDiff.toFixed(2)} (${sign}${pctChange.toFixed(2)}%)`

      const barsPart = this.#barCount !== null ? `${this.#barCount} bars` : null
      const timePart = this.#timeDiff !== null ? formatDuration(this.#timeDiff) : null
      const line2 = [barsPart, timePart].filter(Boolean).join(', ')

      const labelLines = line2 ? [line1, line2] : [line1]

      const fontSize = this.#params['font-size'] * pr
      const lineSpacing = 2 * pr
      const padH = 4 * vpr
      const padW = 6 * hpr
      const radius = 3 * pr

      ctx.font = `${fontSize}px sans-serif`
      const maxLineW = Math.max(...labelLines.map((l) => ctx.measureText(l).width))
      const boxW = maxLineW + padW * 2
      const boxH = fontSize * labelLines.length + lineSpacing * (labelLines.length - 1) + padH * 2

      const bx = midX * hpr - boxW / 2
      const by = this.#p2.y < this.#p1.y ? minY * vpr - boxH - 2 * vpr : maxY * vpr + 2 * vpr

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
      ctx.fillStyle = this.#params['label-fill']
      ctx.fill()

      ctx.fillStyle = this.#params['text-color']
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      const centerX = bx + boxW / 2
      for (let i = 0; i < labelLines.length; i++) {
        ctx.fillText(labelLines[i], centerX, by + padH + i * (fontSize + lineSpacing))
      }

      if (this.#withDots) {
        dot(scope, this.#p1, { color: this.#params['line-color'] })
        dot(scope, this.#p2, { color: this.#params['line-color'] })
      }
    })
  }
}

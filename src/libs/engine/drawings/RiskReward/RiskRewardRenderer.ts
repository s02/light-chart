import type { RiskRewardParams, RiskRewardSettings } from '@engine/drawings/RiskReward/RiskReward'
import { dot } from '@engine/primitives/dot'
import { rect } from '@engine/primitives/rect'
import { line } from '@engine/primitives/line'
import { textLabel } from '@engine/primitives/text-label'
import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type { IPrimitivePaneRenderer, Point } from 'lightweight-charts'
import { formatPrice } from '@engine/helpers'

const LABEL_FONT_SIZE = 12
const LABEL_GAP = 20

// Anchor layout received as pixel points:
//  p0 = midline-left  (anchor, left edge of midline)
//  p1 = top-left
//  p2 = bottom-left
//  p3 = midline-right (right edge of midline)

export class RiskRewardRenderer implements IPrimitivePaneRenderer {
  #p0: Point
  #p1: Point
  #p2: Point
  #p3: Point
  #withDots: boolean
  #params: RiskRewardParams
  #targetPriceOffset: number
  #targetPricePercentOffset: number
  #targetLevelText: string
  #stopPriceOffset: number
  #stopPricePercentOffset: number
  #stopLevelText: string

  #qtyRisk: number

  constructor(
    p0: Point,
    p1: Point,
    p2: Point,
    p3: Point,
    withDots: boolean,
    params: RiskRewardParams,
    settings: RiskRewardSettings
  ) {
    this.#p0 = p0
    this.#p1 = p1
    this.#p2 = p2
    this.#p3 = p3
    this.#withDots = withDots
    this.#params = params

    this.#targetPriceOffset = settings.profitPrice - settings.entryPrice
    this.#targetPricePercentOffset = (this.#targetPriceOffset / settings.entryPrice) * 100
    this.#targetLevelText = `target: ${formatPrice(this.#targetPriceOffset)} (${this.#targetPricePercentOffset.toFixed(2)}%)`

    this.#stopPriceOffset = settings.entryPrice - settings.stopPrice
    this.#stopPricePercentOffset = (this.#stopPriceOffset / settings.entryPrice) * 100

    this.#qtyRisk = settings.riskSize / Math.abs(this.#stopPriceOffset)

    this.#stopLevelText = `stop: ${formatPrice(this.#stopPriceOffset)} (${this.#stopPricePercentOffset.toFixed(2)}%) qty: ${this.#qtyRisk}`
  }

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      const { context: ctx, horizontalPixelRatio: hpr, verticalPixelRatio: vpr } = scope

      const left = this.#p0.x
      const right = this.#p3.x
      const top = this.#p1.y
      const mid = this.#p0.y
      const bottom = this.#p2.y

      const tl = { x: left, y: top } as Point
      const tr = { x: right, y: top } as Point
      const ml = { x: left, y: mid } as Point
      const mr = { x: right, y: mid } as Point
      const bl = { x: left, y: bottom } as Point
      const br = { x: right, y: bottom } as Point

      // Top half — profit (green)
      rect(scope, tl, mr, { fill: this.#params['profit-fill'] })

      // Bottom half — loss (red)
      rect(scope, ml, br, { fill: this.#params['loss-fill'] })

      // Border around full rectangle
      rect(scope, tl, br, {
        'line-color': this.#params['border-color'],
        'line-width': this.#params['border-width']
      })

      // Midline from anchor to right edge
      line(scope, ml, mr, { width: this.#params['line-width'], color: this.#params['line-color'] })

      // External text labels — measure first to center, then draw
      const pr = Math.min(hpr, vpr)
      const fontSize = LABEL_FONT_SIZE * pr
      const paddingW = 6 * hpr
      const paddingH = 4 * vpr
      const boxH = (fontSize + paddingH * 2) / vpr // back to logical px for textLabel

      ctx.font = `${fontSize}px sans-serif`

      const centerX = (left + right) / 2

      const targetBoxW = (ctx.measureText(this.#targetLevelText).width + paddingW * 2) / hpr
      textLabel(scope, { x: centerX - targetBoxW / 2, y: top - LABEL_GAP - boxH } as Point, {
        text: this.#targetLevelText,
        'text-color': 'rgba(255, 255, 255, 0.9)',
        'font-size': LABEL_FONT_SIZE,
        fill: 'rgba(76, 175, 80, 0.85)'
      })

      const stopBoxW = (ctx.measureText(this.#stopLevelText).width + paddingW * 2) / hpr
      textLabel(scope, { x: centerX - stopBoxW / 2, y: bottom + LABEL_GAP } as Point, {
        text: this.#stopLevelText,
        'text-color': 'rgba(255, 255, 255, 0.9)',
        'font-size': LABEL_FONT_SIZE,
        fill: 'rgba(244, 67, 54, 0.85)'
      })

      if (this.#withDots) {
        dot(scope, this.#p0, { color: this.#params['line-color'] })
        dot(scope, this.#p1, { color: this.#params['line-color'] })
        dot(scope, this.#p2, { color: this.#params['line-color'] })
        dot(scope, this.#p3, { color: this.#params['line-color'] })
      }
    })
  }
}

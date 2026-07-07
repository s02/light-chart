import type { BitmapCoordinatesRenderingScope } from 'fancy-canvas'
import type { Point } from 'lightweight-charts'

type Params = {
  'line-width'?: number
  'line-color'?: string
  'fill-color'?: string
}

export const rect = (scope: BitmapCoordinatesRenderingScope, p1: Point, p2: Point, params: Params) => {
  const ctx = scope.context
  const hpr = scope.horizontalPixelRatio
  const vpr = scope.verticalPixelRatio

  const x = Math.min(p1.x, p2.x) * hpr
  const y = Math.min(p1.y, p2.y) * vpr
  const w = Math.abs(p2.x - p1.x) * hpr
  const h = Math.abs(p2.y - p1.y) * vpr

  ctx.beginPath()
  ctx.rect(x, y, w, h)

  ctx.lineWidth = (params['line-width'] ?? 1) * hpr

  if (params['fill-color'] && params['fill-color'] !== 'none') {
    ctx.fillStyle = params['fill-color']
    ctx.fill()
  }

  if (params['line-color']) {
    ctx.strokeStyle = params['line-color']
    ctx.stroke()
  }
}

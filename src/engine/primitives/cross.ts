import type { BitmapCoordinatesRenderingScope } from 'fancy-canvas'
import type { Point } from 'lightweight-charts'

type Params = {
  size: number
  color: string
  lineWidth?: number
}

export const cross = (scope: BitmapCoordinatesRenderingScope, p: Point, params: Params) => {
  const ctx = scope.context
  const hpr = scope.horizontalPixelRatio
  const vpr = scope.verticalPixelRatio
  const half = params.size

  ctx.beginPath()
  ctx.moveTo(p.x * hpr, (p.y - half) * vpr)
  ctx.lineTo(p.x * hpr, (p.y + half) * vpr)
  ctx.moveTo((p.x - half) * hpr, p.y * vpr)
  ctx.lineTo((p.x + half) * hpr, p.y * vpr)

  ctx.lineCap = 'square'
  ctx.lineWidth = (params.lineWidth ?? 2) * hpr
  ctx.strokeStyle = params.color
  ctx.stroke()
}

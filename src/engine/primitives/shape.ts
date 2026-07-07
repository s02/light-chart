import type { BitmapCoordinatesRenderingScope } from 'fancy-canvas'
import type { Point } from 'lightweight-charts'

type Params = {
  'line-width': number
  'line-color': string
  fill?: string
}

export const shape = (scope: BitmapCoordinatesRenderingScope, points: Point[], params: Params) => {
  if (points.length < 2) return

  const ctx = scope.context
  const hpr = scope.horizontalPixelRatio
  const vpr = scope.verticalPixelRatio

  ctx.beginPath()
  ctx.moveTo(points[0].x * hpr, points[0].y * vpr)
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x * hpr, points[i].y * vpr)
  }
  ctx.closePath()

  if (params.fill) {
    ctx.fillStyle = params.fill
    ctx.fill()
  }

  ctx.strokeStyle = params['line-color']
  ctx.lineWidth = params['line-width']
  ctx.stroke()
}

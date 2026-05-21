import { geometry } from '@engine/drawings/geometry'
import type { BitmapCoordinatesRenderingScope } from 'fancy-canvas'
import type { Point } from 'lightweight-charts'

type Params = {
  radius: number
  color?: string
  fill?: string
  width?: number
}

export const circlep = (
  scope: BitmapCoordinatesRenderingScope,
  p1: Point,
  p2: Point,
  params: Omit<Params, 'radius'>
) => {
  const radius = geometry.distance(p1, p2)
  return circle(scope, p1, { ...params, radius })
}

export const circle = (scope: BitmapCoordinatesRenderingScope, p: Point, params: Params) => {
  const ctx = scope.context
  const hpr = scope.horizontalPixelRatio
  const vpr = scope.verticalPixelRatio

  ctx.beginPath()
  ctx.arc(p.x * hpr, p.y * vpr, params.radius * hpr, 0, Math.PI * params.radius * hpr)

  ctx.lineWidth = (params.width ?? 1) * hpr

  if (params.color) {
    ctx.strokeStyle = params.color
    ctx.stroke()
  }

  if (params.fill) {
    ctx.fillStyle = params.fill
    ctx.fill()
  }
}

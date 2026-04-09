import type { BitmapCoordinatesRenderingScope } from 'fancy-canvas'
import type { Coordinate } from 'lightweight-charts'

type Params = {
  radius: number
  color: string
}

export const circle = (scope: BitmapCoordinatesRenderingScope, x: Coordinate, y: Coordinate, params: Params) => {
  const ctx = scope.context
  const hpr = scope.horizontalPixelRatio
  const vpr = scope.verticalPixelRatio

  ctx.beginPath()
  ctx.arc(x * hpr, y * vpr, params.radius * hpr, 0, Math.PI * params.radius * hpr)
  ctx.fillStyle = params.color
  ctx.fill()
}

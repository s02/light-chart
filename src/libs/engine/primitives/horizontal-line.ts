import type { BitmapCoordinatesRenderingScope } from 'fancy-canvas'
import type { Point } from 'lightweight-charts'

type Params = {
  width: number
  color: string
  dash?: boolean
}

export const horizontalLine = (scope: BitmapCoordinatesRenderingScope, p1: Point, p2: Point, params: Params) => {
  const ctx = scope.context
  const hpr = scope.horizontalPixelRatio
  const vpr = scope.verticalPixelRatio

  ctx.beginPath()

  if (params.dash) {
    ctx.setLineDash([4, 4])
  }

  ctx.moveTo(p1.x * hpr, p1.y * vpr)
  ctx.lineTo(p2.x * hpr, p2.y * vpr)
  ctx.strokeStyle = params.color
  ctx.lineWidth = params.width
  ctx.stroke()

  if (params.dash) {
    ctx.setLineDash([])
  }
}

import type { BitmapCoordinatesRenderingScope } from 'fancy-canvas'
import type { Point } from 'lightweight-charts'

type Params = {
  fill: string
}

export const channelFill = (scope: BitmapCoordinatesRenderingScope, upper: Point[], lower: Point[], params: Params) => {
  if (upper.length < 2) return

  const { context: ctx, horizontalPixelRatio: hpr, verticalPixelRatio: vpr } = scope

  ctx.beginPath()
  ctx.moveTo(upper[0].x * hpr, upper[0].y * vpr)

  for (const p of upper) {
    ctx.lineTo(p.x * hpr, p.y * vpr)
  }

  for (let i = lower.length - 1; i >= 0; i--) {
    ctx.lineTo(lower[i].x * hpr, lower[i].y * vpr)
  }

  ctx.closePath()
  ctx.fillStyle = params.fill
  ctx.fill()
}

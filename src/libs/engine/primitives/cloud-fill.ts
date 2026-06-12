import type { BitmapCoordinatesRenderingScope } from 'fancy-canvas'
import type { Point } from 'lightweight-charts'

export const cloudFill = (
  scope: BitmapCoordinatesRenderingScope,
  upper: Point[],
  lower: Point[],
  params: { bull: string; bear: string }
) => {
  if (upper.length < 2) return
  const { context: ctx, horizontalPixelRatio: hpr, verticalPixelRatio: vpr } = scope

  for (let i = 0; i < upper.length - 1; i++) {
    const u0 = upper[i],
      u1 = upper[i + 1]
    const l0 = lower[i],
      l1 = lower[i + 1]

    const isBull0 = u0.y <= l0.y
    const isBull1 = u1.y <= l1.y

    if (isBull0 !== isBull1) {
      const dU = u1.y - u0.y
      const dL = l1.y - l0.y
      const t = (l0.y - u0.y) / (dU - dL)
      const cx = (u0.x + t * (u1.x - u0.x)) * hpr
      const cy = (u0.y + t * dU) * vpr

      ctx.beginPath()
      ctx.moveTo(u0.x * hpr, u0.y * vpr)
      ctx.lineTo(cx, cy)
      ctx.lineTo(l0.x * hpr, l0.y * vpr)
      ctx.closePath()
      ctx.fillStyle = isBull0 ? params.bull : params.bear
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(u1.x * hpr, u1.y * vpr)
      ctx.lineTo(l1.x * hpr, l1.y * vpr)
      ctx.closePath()
      ctx.fillStyle = isBull1 ? params.bull : params.bear
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.moveTo(u0.x * hpr, u0.y * vpr)
      ctx.lineTo(u1.x * hpr, u1.y * vpr)
      ctx.lineTo(l1.x * hpr, l1.y * vpr)
      ctx.lineTo(l0.x * hpr, l0.y * vpr)
      ctx.closePath()
      ctx.fillStyle = isBull0 ? params.bull : params.bear
      ctx.fill()
    }
  }
}

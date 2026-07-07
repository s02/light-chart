import type { BitmapCoordinatesRenderingScope } from 'fancy-canvas'
import type { Point } from 'lightweight-charts'

type Params = {
  text: string
  background: string
}
export const infoMarker = (scope: BitmapCoordinatesRenderingScope, p: Point, params: Params) => {
  const ctx = scope.context
  const hpr = scope.horizontalPixelRatio
  const vpr = scope.verticalPixelRatio

  const paddingH = 2 * vpr
  const paddingW = 3 * hpr
  const fontSize = 13 * hpr

  ctx.font = `bold ${fontSize}px sans-serif`
  const textWidth = ctx.measureText(params.text).width
  const textHeight = fontSize

  ctx.fillStyle = params.background
  ctx.fillRect(p.x * hpr, p.y * vpr, textWidth + paddingW * 2, textHeight + paddingH * 2)

  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(params.text, p.x * hpr + paddingW, p.y * vpr + paddingH)
}

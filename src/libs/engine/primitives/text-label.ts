import type { BitmapCoordinatesRenderingScope } from 'fancy-canvas'
import type { Point } from 'lightweight-charts'

type Params = {
  text: string
  'text-color': string
  'font-size': number
  fill?: string
}

export const textLabel = (scope: BitmapCoordinatesRenderingScope, p: Point, params: Params) => {
  const ctx = scope.context
  const hpr = scope.horizontalPixelRatio
  const vpr = scope.verticalPixelRatio

  const fontSize = params['font-size'] * Math.min(hpr, vpr)
  const paddingH = 4 * vpr
  const paddingW = 6 * hpr
  const radius = 3 * Math.min(hpr, vpr)

  ctx.font = `${fontSize}px sans-serif`
  const textWidth = ctx.measureText(params.text).width
  const boxWidth = textWidth + paddingW * 2
  const boxHeight = fontSize + paddingH * 2

  const x = p.x * hpr
  const y = p.y * vpr

  if (params.fill) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + boxWidth - radius, y)
    ctx.arcTo(x + boxWidth, y, x + boxWidth, y + radius, radius)
    ctx.lineTo(x + boxWidth, y + boxHeight - radius)
    ctx.arcTo(x + boxWidth, y + boxHeight, x + boxWidth - radius, y + boxHeight, radius)
    ctx.lineTo(x + radius, y + boxHeight)
    ctx.arcTo(x, y + boxHeight, x, y + boxHeight - radius, radius)
    ctx.lineTo(x, y + radius)
    ctx.arcTo(x, y, x + radius, y, radius)
    ctx.closePath()
    ctx.fillStyle = params.fill
    ctx.fill()
  }

  ctx.fillStyle = params['text-color']
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(params.text, x + paddingW, y + paddingH)
}

export const textLabelBounds = (text: string, fontSize: number) => {
  const charWidth = fontSize * 0.6
  const paddingH = 4
  const paddingW = 6

  return {
    width: text.length * charWidth + paddingW * 2,
    height: fontSize + paddingH * 2
  }
}

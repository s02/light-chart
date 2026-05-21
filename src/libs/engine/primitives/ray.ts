import type { BitmapCoordinatesRenderingScope } from 'fancy-canvas'
import type { Point } from 'lightweight-charts'

type Params = {
  width: number
  color: string
}

function extendToEdge(p1: Point, p2: Point, canvasW: number, canvasH: number): Point {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y

  if (dx === 0 && dy === 0) return p2

  let t = Infinity

  if (dx > 0) t = Math.min(t, (canvasW - p1.x) / dx)
  else if (dx < 0) t = Math.min(t, -p1.x / dx)

  if (dy > 0) t = Math.min(t, (canvasH - p1.y) / dy)
  else if (dy < 0) t = Math.min(t, -p1.y / dy)

  return { x: p1.x + t * dx, y: p1.y + t * dy }
}

export const ray = (scope: BitmapCoordinatesRenderingScope, p1: Point, p2: Point, params: Params) => {
  const ctx = scope.context
  const hpr = scope.horizontalPixelRatio
  const vpr = scope.verticalPixelRatio

  const canvasW = scope.bitmapSize.width / hpr
  const canvasH = scope.bitmapSize.height / vpr
  const end = extendToEdge(p1, p2, canvasW, canvasH)

  ctx.beginPath()
  ctx.moveTo(p1.x * hpr, p1.y * vpr)
  ctx.lineTo(end.x * hpr, end.y * vpr)
  ctx.strokeStyle = params.color
  ctx.lineWidth = params.width
  ctx.stroke()
}

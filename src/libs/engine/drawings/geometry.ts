import type { Point } from 'lightweight-charts'

const distance = (point1: Point, point2: Point) => {
  const dx = point2.x - point1.x
  const dy = point2.y - point1.y
  return Math.sqrt(dx * dx + dy * dy)
}

const distanceToLineSegment = (point: Point, lineStart: Point, lineEnd: Point) => {
  const dx = lineEnd.x - lineStart.x
  const dy = lineEnd.y - lineStart.y
  const lengthSquared = dx * dx + dy * dy

  if (lengthSquared === 0) {
    const ex = point.x - lineStart.x
    const ey = point.y - lineStart.y
    return Math.sqrt(ex * ex + ey * ey)
  }

  let t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared
  t = Math.max(0, Math.min(1, t))

  const projectionX = lineStart.x + t * dx
  const projectionY = lineStart.y + t * dy
  const px = point.x - projectionX
  const py = point.y - projectionY

  return Math.sqrt(px * px + py * py)
}

const distanceToRay = (point: Point, rayOrigin: Point, rayThrough: Point) => {
  const dx = rayThrough.x - rayOrigin.x
  const dy = rayThrough.y - rayOrigin.y
  const lengthSquared = dx * dx + dy * dy

  if (lengthSquared === 0) {
    const ex = point.x - rayOrigin.x
    const ey = point.y - rayOrigin.y
    return Math.sqrt(ex * ex + ey * ey)
  }

  const t = Math.max(0, ((point.x - rayOrigin.x) * dx + (point.y - rayOrigin.y) * dy) / lengthSquared)

  const projectionX = rayOrigin.x + t * dx
  const projectionY = rayOrigin.y + t * dy
  const px = point.x - projectionX
  const py = point.y - projectionY

  return Math.sqrt(px * px + py * py)
}

export const geometry = {
  distanceToLineSegment,
  distanceToRay,
  distance
}

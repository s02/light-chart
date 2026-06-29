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

const distanceToLine = (point: Point, lineP1: Point, lineP2: Point) => {
  const dx = lineP2.x - lineP1.x
  const dy = lineP2.y - lineP1.y
  const lengthSquared = dx * dx + dy * dy

  if (lengthSquared === 0) {
    const ex = point.x - lineP1.x
    const ey = point.y - lineP1.y
    return Math.sqrt(ex * ex + ey * ey)
  }

  return Math.abs((point.x - lineP1.x) * dy - (point.y - lineP1.y) * dx) / Math.sqrt(lengthSquared)
}

const pointInPolygon = (point: Point, polygon: Point[]) => {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y
    const xj = polygon[j].x, yj = polygon[j].y
    if (yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

export const geometry = {
  distanceToLineSegment,
  distanceToRay,
  distanceToLine,
  distance,
  pointInPolygon
}

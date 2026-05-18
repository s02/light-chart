import type { Point } from 'lightweight-charts'

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

export const geometry = {
  distanceToLineSegment
}

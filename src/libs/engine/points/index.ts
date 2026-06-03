import type { Coordinate, Point, Time } from 'lightweight-charts'

type PointsCollectingStatus = 'pending' | 'done'

export const POINTS_MODE = {
  INF: -1,
  BRUSH: -2
}

export type Anchor = {
  time: Time
  price: number
  x: Coordinate
  y: Coordinate
}

export type PointsHandler = (params: { status: PointsCollectingStatus; points: (Point & Anchor)[] }) => void

export type PointsManager = {
  destroy: () => void
  subscribe: (handler: PointsHandler) => void
}

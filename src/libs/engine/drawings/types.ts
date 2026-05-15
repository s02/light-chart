import type { BarPrice, Coordinate, Logical, Point, Time } from 'lightweight-charts'

export type Anchor = {
  time: Time
  price: number
}

export type DrawingViewport = {
  anchorToPoint: (a: Anchor) => Point | null
  priceScale: {
    coordinateToPrice: (x: Coordinate) => BarPrice | null
    priceToCoordinate: (p: number) => Coordinate | null
  }
  timeScale: {
    coordinateToTime: (x: Coordinate) => Time | null
    timeToCoordinate: (time: Time) => Coordinate | null
    logicalToCoordinate: (l: Logical) => Coordinate | null
  }
}

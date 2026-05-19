import type { BaseDrawing } from './BaseDrawing'
import type { Point, Time } from 'lightweight-charts'

export type Anchor = {
  time: Time
  price: number
}

export type DrawingViewport = {
  anchorToPoint: (a: Anchor) => Point | null
  pointToAnchor: (p: Point) => Anchor | null
}

interface DrawingConstructor {
  new (): BaseDrawing
  readonly ikey: DrawingName
  readonly points: number
  readonly hitThreashold: number
}

export type DrawingGroup = 'lines'
export type DrawingName = 'trend-line' | 'horizontal-line'
export type DrawingScript = { group: DrawingGroup; drawing: DrawingConstructor }

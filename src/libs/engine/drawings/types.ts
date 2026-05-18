import type { Drawing } from '@engine/drawings/Drawing'
import type { Point, Time } from 'lightweight-charts'

export type Anchor = {
  time: Time
  price: number
}

export type DrawingViewport = {
  anchorToPoint: (a: Anchor) => Point | null
}

interface DrawingConstructor {
  new (): Drawing
  readonly ikey: DrawingName
  readonly points: number
  readonly hitThreashold: number
}

export type DrawingGroup = 'lines'
export type DrawingName = 'trend-line' | 'horizontal-line'
export type DrawingScript = { group: DrawingGroup; drawing: DrawingConstructor }

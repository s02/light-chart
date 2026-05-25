import type { StudyParams, StudySchema } from '@engine/schema'
import type { BaseDrawing } from './BaseDrawing'
import type { Coordinate, IChartApi, Point, Time } from 'lightweight-charts'

export type Anchor = {
  time: Time
  price: number
  x: Coordinate
  y: Coordinate
}

export type DrawingViewport = {
  anchorToPoint: (a: Anchor) => Point | null
  pointToAnchor: (p: Point) => Anchor | null
}

export type DrawingSelectFn = (el: { id: number; ds: DrawingSchema }) => void

interface DrawingConstructor {
  new (chart: IChartApi, options?: DrawingOptions): BaseDrawing
  readonly ikey: DrawingName
  readonly points: number
  readonly hitThreashold: number
}

export type DrawingGroup = 'lines' | 'text'
export type DrawingName =
  | 'trend-line'
  | 'horizontal-line'
  | 'vertical-line'
  | 'circle'
  | 'ray'
  | 'text'
  | 'anchored-text'
export type DrawingScript = { group: DrawingGroup; drawing: DrawingConstructor }

export type DrawingOptions = {
  params?: StudyParams
}

export type DrawingSchema = {
  ikey: DrawingName
  schema: StudySchema
  params: StudyParams
}

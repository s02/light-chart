import type { StudyParams, StudySchema } from '@engine/schema'
import type { BaseDrawing } from './BaseDrawing'
import type { Coordinate, IChartApi, Point, Time } from 'lightweight-charts'
import type { DrawingName } from '@engine/drawings'

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

export type DrawingScript = {
  group: string
  drawing: {
    new (chart: IChartApi, options?: DrawingOptions): BaseDrawing
    readonly ikey: string
    readonly points: number
    readonly hitThreashold: number
  }
  icon: string
}

export type DrawingOptions = {
  params?: StudyParams
}

export type DrawingSchema = {
  ikey: DrawingName
  schema: StudySchema
  params: StudyParams
}

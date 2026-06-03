import type { StudyParams, StudySchema } from '@engine/schema'
import type { Point, Time } from 'lightweight-charts'
import type { DrawingName } from '@engine/drawings'
import type { Anchor } from '@engine/points'

export type DrawingViewport = {
  anchorToPoint: (a: { time: Time; price: number }) => Point | null
  pointToAnchor: (p: Point) => Anchor | null
}

export type DrawingSelectFn = (el: { id: number; ds: DrawingSchema }) => void

export type DrawingOptions = {
  params?: StudyParams
}

export type DrawingSchema = {
  ikey: DrawingName
  schema: StudySchema
  params: StudyParams
}

import type { StudyParams, StudySchema } from '@engine/schema'
import type { Point, Time } from 'lightweight-charts'
import type { Anchor } from '@engine/points'
import type { DRAWINGS } from '@engine/drawings'

export type DrawingViewport = {
  anchorToPoint: (a: { time: Time; price: number }) => Point | null
  pointToAnchor: (p: Point) => Anchor | null
  barsBetween: (t1: Time, t2: Time) => number | null
}

export type DrawingSelectFn = (el: { id: number; ds: DrawingSchema }) => void

export type DrawingOptions = {
  params?: StudyParams
}

export type DrawingSchema = {
  ikey: string
  schema: StudySchema
  params: StudyParams
}

export type DrawingGroup = (typeof DRAWINGS)[number]['group']

export type DrawingName = (typeof DRAWINGS)[number]['drawing']['ikey']

export type DrawingScript = (typeof DRAWINGS)[number]

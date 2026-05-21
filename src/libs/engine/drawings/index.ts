import { Circle } from '@engine/drawings/Circle/Circle'
import { HorizontalLine } from '@engine/drawings/HorizontalLine/HorizontalLine'
import { Ray } from '@engine/drawings/Ray/Ray'
import { TrendLine } from '@engine/drawings/TrendLine/TrendLine'
import { VerticalLine } from '@engine/drawings/VerticalLine/VerticalLine'
import type { DrawingScript } from '@engine/drawings/types'

export const DRAWINGS: DrawingScript[] = [
  {
    group: 'lines',
    drawing: TrendLine
  },
  {
    group: 'lines',
    drawing: Ray
  },
  {
    group: 'lines',
    drawing: HorizontalLine
  },
  {
    group: 'lines',
    drawing: VerticalLine
  },
  {
    group: 'lines',
    drawing: Circle
  }
]

export { DrawingsManager } from '@engine/drawings/DrawingsManager'
export type { DrawingGroup, DrawingName, DrawingScript, DrawingSchema } from '@engine/drawings/types'

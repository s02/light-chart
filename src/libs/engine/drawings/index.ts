import { HorizontalLine } from '@engine/drawings/HorizontalLine/HorizontalLine'
import { TrendLine } from '@engine/drawings/TrendLine/TrendLine'
import type { DrawingScript } from '@engine/drawings/types'

export const DRAWINGS: DrawingScript[] = [
  {
    group: 'lines',
    drawing: TrendLine
  },
  {
    group: 'lines',
    drawing: HorizontalLine
  }
]

export { DrawingsManager } from '@engine/drawings/DrawingsManager'
export type { DrawingGroup, DrawingName, DrawingScript } from '@engine/drawings/types'

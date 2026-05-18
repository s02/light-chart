import { HorizontalLine } from '@engine/drawings/HorizontalLine/HorizontalLine'
import { TrendLine } from '@engine/drawings/TrendLine/TrendLine'
import type { DrawingScript } from './types'

export type { DrawingGroup, DrawingName, DrawingScript } from './types'
export { DrawingsOverlay } from './DrawingsOverlay'

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

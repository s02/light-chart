import { Drawing } from '@engine/drawings/Drawing'
import { HorizontalLine } from '@engine/drawings/HorizontalLine/HorizontalLine'
import { TrendLine } from '@engine/drawings/TrendLine/TrendLine'

interface DrawingConstructor {
  new (): Drawing
  readonly ikey: DrawingName
  readonly points: number
  readonly hitThreashold: number
}

export type DrawingGroup = 'lines'
export type DrawingName = 'trend-line' | 'horizontal-line'
export type DrawingScript = { group: DrawingGroup; drawing: DrawingConstructor }

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

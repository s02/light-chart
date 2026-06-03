import { Arrow } from '@engine/drawings/Arrow/Arrow'
import { Circle } from '@engine/drawings/Circle/Circle'
import { ExtendedLine } from '@engine/drawings/ExtendedLine/ExtendedLine'
import { Rectangle } from '@engine/drawings/Rectangle/Rectangle'
import { HorizontalLine } from '@engine/drawings/HorizontalLine/HorizontalLine'
import { HorizontalRay } from '@engine/drawings/HorizontalRay/HorizontalRay'
import { Ray } from '@engine/drawings/Ray/Ray'
import { TrendLine } from '@engine/drawings/TrendLine/TrendLine'
import { VerticalLine } from '@engine/drawings/VerticalLine/VerticalLine'
import { TextDrawing } from '@engine/drawings/Text/TextDrawing'
import { AnchoredText } from '@engine/drawings/AnchoredText/AnchoredText'
import { ParallelChannel } from '@engine/drawings/ParallelChannel/ParallelChannel'
import { Path } from '@engine/drawings/Path/Path'
import { GannSquare } from '@engine/drawings/GannSquare/GannSquare'
import { Brush } from '@engine/drawings/Brush/Brush'
import { Highlighter } from '@engine/drawings/Highlighter/Highlighter'

const icons = import.meta.glob('./*/icon.svg', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>

export const DRAWINGS = [
  {
    group: 'trend-line-tools',
    subgroup: 'lines',
    drawing: TrendLine,
    icon: icons['./TrendLine/icon.svg']
  },
  {
    group: 'trend-line-tools',
    subgroup: 'lines',
    drawing: ExtendedLine,
    icon: icons['./ExtendedLine/icon.svg']
  },
  {
    group: 'trend-line-tools',
    subgroup: 'lines',
    drawing: Ray,
    icon: icons['./Ray/icon.svg']
  },
  {
    group: 'trend-line-tools',
    subgroup: 'lines',
    drawing: HorizontalRay,
    icon: icons['./HorizontalRay/icon.svg']
  },
  {
    group: 'trend-line-tools',
    subgroup: 'lines',
    drawing: HorizontalLine,
    icon: icons['./HorizontalLine/icon.svg']
  },
  {
    group: 'trend-line-tools',
    subgroup: 'lines',
    drawing: VerticalLine,
    icon: icons['./VerticalLine/icon.svg']
  },
  {
    group: 'trend-line-tools',
    subgroup: 'channels',
    drawing: ParallelChannel,
    icon: icons['./ParallelChannel/icon.svg']
  },
  {
    group: 'gann-and-fib',
    subgroup: 'gann',
    drawing: GannSquare,
    icon: icons['./GannSquare/icon.svg']
  },
  {
    group: 'annotation-tools',
    subgroup: 'text',
    drawing: TextDrawing,
    icon: icons['./Text/icon.svg']
  },
  {
    group: 'annotation-tools',
    subgroup: 'text',
    drawing: AnchoredText,
    icon: icons['./AnchoredText/icon.svg']
  },
  {
    group: 'geometric-shapes',
    subgroup: 'brushes',
    drawing: Brush,
    icon: icons['./Brush/icon.svg']
  },
  {
    group: 'geometric-shapes',
    subgroup: 'brushes',
    drawing: Highlighter,
    icon: icons['./Highlighter/icon.svg']
  },
  {
    group: 'geometric-shapes',
    subgroup: 'arrows',
    drawing: Arrow,
    icon: icons['./Arrow/icon.svg']
  },
  {
    group: 'geometric-shapes',
    subgroup: 'shapes',
    drawing: Rectangle,
    icon: icons['./Rectangle/icon.svg']
  },
  {
    group: 'geometric-shapes',
    subgroup: 'shapes',
    drawing: Path,
    icon: icons['./Path/icon.svg']
  },
  {
    group: 'geometric-shapes',
    subgroup: 'shapes',
    drawing: Circle,
    icon: icons['./Circle/icon.svg']
  }
] as const

export { DrawingsManager } from '@engine/drawings/DrawingsManager'

export const findDrawingScript = (key: string) => {
  return DRAWINGS.find((d) => d.drawing.ikey === key)
}

export type DrawingGroup = (typeof DRAWINGS)[number]['group']
export type DrawingScript = (typeof DRAWINGS)[number]
export type DrawingName = DrawingScript['drawing']['ikey']
export type { DrawingSchema } from '@engine/drawings/types'
export { DRAWING_COLORS } from './constants'

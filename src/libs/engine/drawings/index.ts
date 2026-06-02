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

const icons = import.meta.glob('./*/icon.svg', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>

export const DRAWINGS = [
  {
    group: 'lines',
    drawing: TrendLine,
    icon: icons['./TrendLine/icon.svg']
  },
  {
    group: 'lines',
    drawing: Arrow,
    icon: icons['./Arrow/icon.svg']
  },
  {
    group: 'lines',
    drawing: ExtendedLine,
    icon: icons['./ExtendedLine/icon.svg']
  },
  {
    group: 'lines',
    drawing: Ray,
    icon: icons['./Ray/icon.svg']
  },
  {
    group: 'lines',
    drawing: HorizontalRay,
    icon: icons['./HorizontalRay/icon.svg']
  },
  {
    group: 'lines',
    drawing: HorizontalLine,
    icon: icons['./HorizontalLine/icon.svg']
  },
  {
    group: 'lines',
    drawing: VerticalLine,
    icon: icons['./VerticalLine/icon.svg']
  },
  {
    group: 'lines',
    drawing: Rectangle,
    icon: icons['./Rectangle/icon.svg']
  },
  {
    group: 'lines',
    drawing: ParallelChannel,
    icon: icons['./ParallelChannel/icon.svg']
  },
  {
    group: 'lines',
    drawing: Circle,
    icon: icons['./Circle/icon.svg']
  },
  {
    group: 'lines',
    drawing: Path,
    icon: icons['./Path/icon.svg']
  },
  {
    group: 'lines',
    drawing: GannSquare,
    icon: icons['./GannSquare/icon.svg']
  },
  {
    group: 'lines',
    drawing: Brush,
    icon: icons['./Brush/icon.svg']
  },
  {
    group: 'text',
    drawing: TextDrawing,
    icon: icons['./Text/icon.svg']
  },
  {
    group: 'text',
    drawing: AnchoredText,
    icon: icons['./AnchoredText/icon.svg']
  }
] as const

export { DrawingsManager } from '@engine/drawings/DrawingsManager'

export type DrawingGroup = (typeof DRAWINGS)[number]['group']
export type DrawingName = (typeof DRAWINGS)[number]['drawing']['ikey']
export type { DrawingSchema } from '@engine/drawings/types'

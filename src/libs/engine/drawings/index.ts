import { Arrow } from '@engine/drawings/Arrow/Arrow'
import { Circle } from '@engine/drawings/Circle/Circle'
import { ExtendedLine } from '@engine/drawings/ExtendedLine/ExtendedLine'
import { Rectangle } from '@engine/drawings/Rectangle/Rectangle'
import { HorizontalLine } from '@engine/drawings/HorizontalLine/HorizontalLine'
import { HorizontalRay } from '@engine/drawings/HorizontalRay/HorizontalRay'
import { Ray } from '@engine/drawings/Ray/Ray'
import { TrendLine } from '@engine/drawings/TrendLine/TrendLine'
import { VerticalLine } from '@engine/drawings/VerticalLine/VerticalLine'
import { Cross } from '@engine/drawings/Cross/Cross'
import { ArrowMarkUp } from '@engine/drawings/ArrowMarkUp/ArrowMarkUp'
import { ArrowMarkDown } from '@engine/drawings/ArrowMarkDown/ArrowMarkDown'
import { ArrowMarkLeft } from '@engine/drawings/ArrowMarkLeft/ArrowMarkLeft'
import { ArrowMarkRight } from '@engine/drawings/ArrowMarkRight/ArrowMarkRight'
import { TextDrawing } from '@engine/drawings/Text/TextDrawing'
import { AnchoredText } from '@engine/drawings/AnchoredText/AnchoredText'
import { SignPost } from '@engine/drawings/SignPost/SignPost'
import { Callout } from '@engine/drawings/Callout/Callout'
import { ParallelChannel } from '@engine/drawings/ParallelChannel/ParallelChannel'
import { Path } from '@engine/drawings/Path/Path'
import { GannSquare } from '@engine/drawings/GannSquare/GannSquare'
import { Brush } from '@engine/drawings/Brush/Brush'
import { Highlighter } from '@engine/drawings/Highlighter/Highlighter'
import { ElliottDouble } from '@engine/drawings/ElliottDouble/ElliottDouble'
import type { IChartApi } from 'lightweight-charts'
import type { BaseDrawing } from '@engine/drawings/BaseDrawing'

const icons = import.meta.glob('./*/icon.svg', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>

export const DRAWINGS = [
  {
    group: 'trend-line-tools' as const,
    subgroup: 'lines',
    drawing: TrendLine,
    icon: icons['./TrendLine/icon.svg']
  },
  {
    group: 'trend-line-tools' as const,
    subgroup: 'lines',
    drawing: ExtendedLine,
    icon: icons['./ExtendedLine/icon.svg']
  },
  {
    group: 'trend-line-tools' as const,
    subgroup: 'lines',
    drawing: Ray,
    icon: icons['./Ray/icon.svg']
  },
  {
    group: 'trend-line-tools' as const,
    subgroup: 'lines',
    drawing: HorizontalRay,
    icon: icons['./HorizontalRay/icon.svg']
  },
  {
    group: 'trend-line-tools' as const,
    subgroup: 'lines',
    drawing: HorizontalLine,
    icon: icons['./HorizontalLine/icon.svg']
  },
  {
    group: 'trend-line-tools' as const,
    subgroup: 'lines',
    drawing: VerticalLine,
    icon: icons['./VerticalLine/icon.svg']
  },
  {
    group: 'trend-line-tools' as const,
    subgroup: 'lines',
    drawing: Cross,
    icon: icons['./Cross/icon.svg']
  },
  {
    group: 'trend-line-tools' as const,
    subgroup: 'channels',
    drawing: ParallelChannel,
    icon: icons['./ParallelChannel/icon.svg']
  },
  {
    group: 'gann-and-fib' as const,
    subgroup: 'gann',
    drawing: GannSquare,
    icon: icons['./GannSquare/icon.svg']
  },
  {
    group: 'annotation-tools' as const,
    subgroup: 'text',
    drawing: TextDrawing,
    icon: icons['./Text/icon.svg']
  },
  {
    group: 'annotation-tools' as const,
    subgroup: 'text',
    drawing: AnchoredText,
    icon: icons['./AnchoredText/icon.svg']
  },
  {
    group: 'annotation-tools' as const,
    subgroup: 'text',
    drawing: SignPost,
    icon: icons['./SignPost/icon.svg']
  },
  {
    group: 'annotation-tools' as const,
    subgroup: 'text',
    drawing: Callout,
    icon: icons['./Callout/icon.svg']
  },
  {
    group: 'geometric-shapes' as const,
    subgroup: 'brushes',
    drawing: Brush,
    manualStop: true,
    icon: icons['./Brush/icon.svg']
  },
  {
    group: 'geometric-shapes' as const,
    subgroup: 'brushes',
    drawing: Highlighter,
    manualStop: true,
    icon: icons['./Highlighter/icon.svg']
  },
  {
    group: 'geometric-shapes' as const,
    subgroup: 'arrows',
    drawing: Arrow,
    icon: icons['./Arrow/icon.svg']
  },
  {
    group: 'geometric-shapes' as const,
    subgroup: 'arrows',
    drawing: ArrowMarkUp,
    icon: icons['./ArrowMarkUp/icon.svg']
  },
  {
    group: 'geometric-shapes' as const,
    subgroup: 'arrows',
    drawing: ArrowMarkDown,
    icon: icons['./ArrowMarkDown/icon.svg']
  },
  {
    group: 'geometric-shapes' as const,
    subgroup: 'arrows',
    drawing: ArrowMarkLeft,
    icon: icons['./ArrowMarkLeft/icon.svg']
  },
  {
    group: 'geometric-shapes' as const,
    subgroup: 'arrows',
    drawing: ArrowMarkRight,
    icon: icons['./ArrowMarkRight/icon.svg']
  },
  {
    group: 'geometric-shapes' as const,
    subgroup: 'shapes',
    drawing: Rectangle,
    icon: icons['./Rectangle/icon.svg']
  },
  {
    group: 'geometric-shapes' as const,
    subgroup: 'shapes',
    drawing: Path,
    icon: icons['./Path/icon.svg']
  },
  {
    group: 'geometric-shapes' as const,
    subgroup: 'shapes',
    drawing: Circle,
    icon: icons['./Circle/icon.svg']
  },
  {
    group: 'patterns' as const,
    subgroup: 'elliott-waves',
    drawing: ElliottDouble,
    icon: icons['./ElliottDouble/icon.svg']
  }
] satisfies {
  group: string
  subgroup: string
  icon: string
  manualStop?: boolean
  drawing: {
    new (chart: IChartApi): BaseDrawing
    readonly ikey: string
  }
}[]

export { DrawingsManager } from '@engine/drawings/DrawingsManager'

export const findDrawingScript = (key: string) => {
  return DRAWINGS.find((d) => d.drawing.ikey === key)
}

export { DRAWING_COLORS } from './constants'

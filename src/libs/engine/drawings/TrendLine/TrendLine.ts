import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import { BaseDrawing } from '../BaseDrawing'
import { geometry } from '../geometry'
import { TrendLinePaneView } from './TrendLinePaneView'
import type { IChartApi, Point } from 'lightweight-charts'
import type { DrawingName, DrawingOptions } from '@engine/drawings/types'

const TREND_LINE_SCHEMA = {
  inputs: [{ type: 'number', key: 'line-width', default: 1 }],
  style: [{ type: 'color', key: 'line-color', default: 'rgb(41 98 255)' }]
} as const satisfies StudySchema

export type TrendLineParams = InferStudyValues<typeof TREND_LINE_SCHEMA.inputs> &
  InferStudyValues<typeof TREND_LINE_SCHEMA.style>

export class TrendLine extends BaseDrawing {
  static readonly ikey: DrawingName = 'trend-line'
  static readonly points = 2
  #params: TrendLineParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(TREND_LINE_SCHEMA.inputs, TREND_LINE_SCHEMA.style, options?.params)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(TREND_LINE_SCHEMA.inputs, TREND_LINE_SCHEMA.style, params)
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: TrendLine.ikey,
      schema: TREND_LINE_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport) {
      return [new TrendLinePaneView(viewport, this.anchors, this.anchorsVisible, this.#params)]
    }

    return []
  }

  override checkTap(point: Point) {
    const viewport = this.getViewport()
    if (!viewport) {
      return false
    }

    const start = viewport.anchorToPoint(this.anchors[0])
    const end = viewport.anchorToPoint(this.anchors[1])

    if (!start || !end) return false

    const distance = geometry.distanceToLineSegment(point, start, end)
    return distance < TrendLine.hitThreashold
  }
}

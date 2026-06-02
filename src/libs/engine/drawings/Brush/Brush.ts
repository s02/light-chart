import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { BrushPaneView } from '@engine/drawings/Brush/BrushPaneView'
import type { DrawingOptions } from '@engine/drawings/types'
import { CONTINUOUS_POINTS_MODE } from '@engine/drawings/ContinuousPointsCollector'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import type { IChartApi, Point } from 'lightweight-charts'
import { geometry } from '../geometry'

const BRUSH_SCHEMA = {
  inputs: [{ type: 'number', key: 'line-width', default: 2 }],
  style: [{ type: 'color', key: 'line-color', default: 'rgb(41 98 255)' }]
} as const satisfies StudySchema

export type BrushParams = InferStudyValues<typeof BRUSH_SCHEMA.inputs> & InferStudyValues<typeof BRUSH_SCHEMA.style>

export class Brush extends BaseDrawing {
  static readonly ikey = 'brush' as const
  static readonly points = CONTINUOUS_POINTS_MODE
  #params: BrushParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(BRUSH_SCHEMA.inputs, BRUSH_SCHEMA.style, options?.params)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(BRUSH_SCHEMA.inputs, BRUSH_SCHEMA.style, params)
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: Brush.ikey,
      schema: BRUSH_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport) {
      return [new BrushPaneView(viewport, this.anchors, this.#params)]
    }
    return []
  }

  override checkAnchor(_point: Point) {
    return null
  }

  override checkTap(point: Point) {
    const viewport = this.getViewport()
    if (!viewport) return false

    for (let i = 0; i < this.anchors.length - 1; i++) {
      const start = viewport.anchorToPoint(this.anchors[i])
      const end = viewport.anchorToPoint(this.anchors[i + 1])

      if (start && end && geometry.distanceToLineSegment(point, start, end) < Brush.hitThreashold) {
        return true
      }
    }

    return false
  }
}

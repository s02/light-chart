import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { HighlighterPaneView } from '@engine/drawings/Highlighter/HighlighterPaneView'
import type { DrawingOptions } from '@engine/drawings/types'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import type { IChartApi, Point } from 'lightweight-charts'
import { geometry } from '../geometry'
import { POINTS_MODE } from '@engine/points'

const HIGHLIGHTER_SCHEMA = {
  inputs: [{ type: 'number', key: 'brush-width', default: 20, options: [8, 12, 20, 32, 48, 64, 80, 96] }],
  style: [{ type: 'color', key: 'line-color', default: 'rgb(255 255 255 / 25%)' }]
} as const satisfies StudySchema

export type HighlighterParams = InferStudyValues<typeof HIGHLIGHTER_SCHEMA.inputs> &
  InferStudyValues<typeof HIGHLIGHTER_SCHEMA.style>

export class Highlighter extends BaseDrawing {
  static readonly ikey = 'highlighter' as const
  static readonly points = POINTS_MODE.BRUSH
  #params: HighlighterParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(HIGHLIGHTER_SCHEMA.inputs, HIGHLIGHTER_SCHEMA.style, options?.params)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(HIGHLIGHTER_SCHEMA.inputs, HIGHLIGHTER_SCHEMA.style, params)
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: Highlighter.ikey,
      schema: HIGHLIGHTER_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport) {
      return [new HighlighterPaneView(viewport, this.anchors, this.#params)]
    }
    return []
  }

  override checkAnchor(_point: Point) {
    return null
  }

  override checkTap(point: Point) {
    const viewport = this.getViewport()
    if (!viewport) return false

    const hitRadius = this.#params['brush-width'] / 2 + Highlighter.hitThreashold

    for (let i = 0; i < this.anchors.length - 1; i++) {
      const start = viewport.anchorToPoint(this.anchors[i])
      const end = viewport.anchorToPoint(this.anchors[i + 1])

      if (start && end && geometry.distanceToLineSegment(point, start, end) < hitRadius) {
        return true
      }
    }

    return false
  }
}

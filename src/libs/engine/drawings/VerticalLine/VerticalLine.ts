import { BaseDrawing } from '../BaseDrawing'
import { resolveStudyParams } from '@engine/schema'
import { VerticalLinePaneView } from '@engine/drawings/VerticalLine/VertialLinePaneView'
import type { InferStudyValues, StudyParams, StudySchema } from '@engine/schema'
import type { DrawingOptions } from '@engine/drawings/types'
import type { IChartApi, Point } from 'lightweight-charts'

const VERTICAL_LINE_SCHEMA = {
  inputs: [{ type: 'number', key: 'line-width', default: 1 }],
  style: [{ type: 'color', key: 'line-color', default: 'rgb(70 224 245)' }]
} as const satisfies StudySchema

export type VerticalLineParams = InferStudyValues<typeof VERTICAL_LINE_SCHEMA.inputs> &
  InferStudyValues<typeof VERTICAL_LINE_SCHEMA.style>

export class VerticalLine extends BaseDrawing {
  static readonly ikey = 'vertical-line' as const
  static readonly points = 1

  #params: VerticalLineParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(VERTICAL_LINE_SCHEMA.inputs, VERTICAL_LINE_SCHEMA.style, options?.params)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(VERTICAL_LINE_SCHEMA.inputs, VERTICAL_LINE_SCHEMA.style, params)
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: VerticalLine.ikey,
      schema: VERTICAL_LINE_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()

    if (viewport && this.anchors.length === 1) {
      return [new VerticalLinePaneView(viewport, this.anchors[0], this.anchorsVisible, this.#params)]
    }

    return []
  }

  override checkTap(point: Point): boolean {
    const viewport = this.getViewport()
    if (!viewport) {
      return false
    }

    const p = viewport.anchorToPoint(this.anchors[0])

    if (!p) {
      return false
    }

    return Math.abs(point.x - p.x) <= VerticalLine.hitThreashold
  }
}

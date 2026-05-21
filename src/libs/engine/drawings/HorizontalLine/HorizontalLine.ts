import type { DrawingName, DrawingOptions } from '@engine/drawings/types'
import { BaseDrawing } from '../BaseDrawing'
import { HorizontalLinePaneView } from './HorizontalLinePaneView'
import type { IChartApi, Point } from 'lightweight-charts'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'

const HORIZONTAL_LINE_SCHEMA = {
  inputs: [{ type: 'number', key: 'width', default: 1, min: 1 }],
  style: [{ type: 'color', key: 'color', default: '#46e0f5' }]
} as const satisfies StudySchema

export type HorizontalLineParams = InferStudyValues<typeof HORIZONTAL_LINE_SCHEMA.inputs> &
  InferStudyValues<typeof HORIZONTAL_LINE_SCHEMA.style>

export class HorizontalLine extends BaseDrawing {
  static readonly ikey: DrawingName = 'horizontal-line'
  static readonly points = 1

  #params: HorizontalLineParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(HORIZONTAL_LINE_SCHEMA.inputs, HORIZONTAL_LINE_SCHEMA.style, options?.params)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(HORIZONTAL_LINE_SCHEMA.inputs, HORIZONTAL_LINE_SCHEMA.style, params)
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: HorizontalLine.ikey,
      schema: HORIZONTAL_LINE_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()

    if (viewport && this.anchors.length === 1) {
      return [new HorizontalLinePaneView(viewport, this.anchors[0], this.anchorsVisible, this.#params)]
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

    return Math.abs(point.y - p.y) <= HorizontalLine.hitThreashold
  }
}

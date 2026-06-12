import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { ElliottDoublePaneView } from '@engine/drawings/ElliottDouble/ElliottDoublePaneView'
import { geometry } from '@engine/drawings/geometry'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import type { DrawingOptions } from '@engine/drawings/types'
import type { IChartApi, Point } from 'lightweight-charts'

const ELLIOTT_DOUBLE_SCHEMA = {
  inputs: [
    { type: 'number', key: 'line-width', default: 1 },
    { type: 'number', key: 'font-size', default: 11 }
  ],
  style: [
    { type: 'color', key: 'line-color', default: 'rgb(33 150 243)' },
    { type: 'color', key: 'text-color', default: 'rgb(33 150 243)' }
  ]
} as const satisfies StudySchema

export type ElliottDoubleParams = InferStudyValues<typeof ELLIOTT_DOUBLE_SCHEMA.inputs> &
  InferStudyValues<typeof ELLIOTT_DOUBLE_SCHEMA.style>

export class ElliottDouble extends BaseDrawing {
  static readonly ikey = 'elliott-double' as const
  static readonly points = 4

  #params: ElliottDoubleParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(ELLIOTT_DOUBLE_SCHEMA.inputs, ELLIOTT_DOUBLE_SCHEMA.style, options?.params)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(ELLIOTT_DOUBLE_SCHEMA.inputs, ELLIOTT_DOUBLE_SCHEMA.style, params)
    if (this.requestUpdate) this.requestUpdate()
  }

  override getSchema() {
    return {
      ikey: ElliottDouble.ikey,
      schema: ELLIOTT_DOUBLE_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport && this.anchors.length > 0) {
      return [new ElliottDoublePaneView(viewport, this.anchors, this.anchorsVisible, this.#params)]
    }
    return []
  }

  override checkTap(point: Point): boolean {
    const viewport = this.getViewport()
    if (!viewport) return false

    for (let i = 0; i < this.anchors.length - 1; i++) {
      const start = viewport.anchorToPoint(this.anchors[i])
      const end = viewport.anchorToPoint(this.anchors[i + 1])
      if (start && end && geometry.distanceToLineSegment(point, start, end) < ElliottDouble.hitThreashold) {
        return true
      }
    }

    return false
  }
}

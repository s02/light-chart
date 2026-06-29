import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import { BaseDrawing } from '../BaseDrawing'
import { HorizontalRayPaneView } from './HorizontalRayPaneView'
import type { IChartApi, Point } from 'lightweight-charts'
import type { DrawingOptions } from '@engine/drawings/types'

const HORIZONTAL_RAY_SCHEMA = {
  inputs: [],
  style: [
    { type: 'color', key: 'line-color', default: 'rgb(242 54 69)', fastPanel: true },
    { type: 'number', key: 'line-width', default: 2, fastPanel: true }
  ]
} as const satisfies StudySchema

export type HorizontalRayParams = InferStudyValues<typeof HORIZONTAL_RAY_SCHEMA.inputs> &
  InferStudyValues<typeof HORIZONTAL_RAY_SCHEMA.style>

export class HorizontalRay extends BaseDrawing {
  static readonly ikey = 'horizontal-ray' as const
  static readonly points = 1
  #params: HorizontalRayParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(HORIZONTAL_RAY_SCHEMA.inputs, HORIZONTAL_RAY_SCHEMA.style, options?.params)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(HORIZONTAL_RAY_SCHEMA.inputs, HORIZONTAL_RAY_SCHEMA.style, params)
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: HorizontalRay.ikey,
      schema: HORIZONTAL_RAY_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport && this.anchors.length === 1) {
      return [new HorizontalRayPaneView(viewport, this.anchors[0], this.anchorsVisible, this.#params)]
    }
    return []
  }

  override checkTap(point: Point) {
    const viewport = this.getViewport()
    if (!viewport) return false

    const p = viewport.anchorToPoint(this.anchors[0])
    if (!p) return false

    if (point.x < p.x) return false
    return Math.abs(point.y - p.y) <= HorizontalRay.hitThreashold
  }
}

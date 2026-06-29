import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import { BaseDrawing } from '../BaseDrawing'
import { geometry } from '../geometry'
import { RayPaneView } from './RayPaneView'
import type { IChartApi, Point } from 'lightweight-charts'
import type { DrawingOptions } from '@engine/drawings/types'

const RAY_SCHEMA = {
  inputs: [],
  style: [
    { type: 'color', key: 'line-color', default: 'rgb(0 188 212)', fastPanel: true },
    { type: 'number', key: 'line-width', default: 2, fastPanel: true }
  ]
} as const satisfies StudySchema

export type RayParams = InferStudyValues<typeof RAY_SCHEMA.inputs> & InferStudyValues<typeof RAY_SCHEMA.style>

export class Ray extends BaseDrawing {
  static readonly ikey = 'ray' as const
  static readonly points = 2
  #params: RayParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(RAY_SCHEMA.inputs, RAY_SCHEMA.style, options?.params)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(RAY_SCHEMA.inputs, RAY_SCHEMA.style, params)
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: Ray.ikey,
      schema: RAY_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport) {
      return [new RayPaneView(viewport, this.anchors, this.anchorsVisible, this.#params)]
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

    const distance = geometry.distanceToRay(point, start, end)
    return distance < Ray.hitThreashold
  }
}

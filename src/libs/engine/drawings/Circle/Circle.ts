import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { CirclePaneView } from '@engine/drawings/Circle/CirclePaneView'
import { geometry } from '@engine/drawings/geometry'
import type { DrawingName, DrawingOptions } from '@engine/drawings/types'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import type { IChartApi, Point } from 'lightweight-charts'

const CIRCLE_SCHEMA = {
  inputs: [{ type: 'number', key: 'width', default: 1, min: 1 }],
  style: [{ type: 'color', key: 'color', default: '#2962FF' }]
} as const satisfies StudySchema

export type CircleParams = InferStudyValues<typeof CIRCLE_SCHEMA.inputs> & InferStudyValues<typeof CIRCLE_SCHEMA.style>

export class Circle extends BaseDrawing {
  static readonly ikey: DrawingName = 'circle'
  static readonly points = 2
  #params: CircleParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(CIRCLE_SCHEMA.inputs, CIRCLE_SCHEMA.style, options?.params)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(CIRCLE_SCHEMA.inputs, CIRCLE_SCHEMA.style, params)
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: Circle.ikey,
      schema: CIRCLE_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport) {
      return [new CirclePaneView(viewport, this.anchors, this.anchorsVisible, this.#params)]
    }

    return []
  }

  override checkTap(point: Point) {
    const viewport = this.getViewport()
    if (!viewport) {
      return false
    }

    const center = viewport.anchorToPoint(this.anchors[0])
    const edge = viewport.anchorToPoint(this.anchors[1])

    if (!center || !edge) return false

    const distToCenter = geometry.distance(point, center)
    const radius = geometry.distance(center, edge)
    return Math.abs(distToCenter - radius) <= Circle.hitThreashold
  }
}

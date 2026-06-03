import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import { BaseDrawing } from '../BaseDrawing'
import { geometry } from '../geometry'
import { ArrowPaneView } from './ArrowPaneView'
import type { IChartApi, Point } from 'lightweight-charts'
import type { DrawingOptions } from '@engine/drawings/types'

const ARROW_SCHEMA = {
  inputs: [{ type: 'number', key: 'line-width', default: 2 }],
  style: [{ type: 'color', key: 'line-color', default: 'rgb(103 58 183)' }]
} as const satisfies StudySchema

export type ArrowParams = InferStudyValues<typeof ARROW_SCHEMA.inputs> & InferStudyValues<typeof ARROW_SCHEMA.style>

export class Arrow extends BaseDrawing {
  static readonly ikey = 'arrow' as const
  static readonly points = 2
  #params: ArrowParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(ARROW_SCHEMA.inputs, ARROW_SCHEMA.style, options?.params)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(ARROW_SCHEMA.inputs, ARROW_SCHEMA.style, params)
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: Arrow.ikey,
      schema: ARROW_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport) {
      return [new ArrowPaneView(viewport, this.anchors, this.anchorsVisible, this.#params)]
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
    return distance < Arrow.hitThreashold
  }
}

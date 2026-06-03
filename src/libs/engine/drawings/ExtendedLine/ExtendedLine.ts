import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import { BaseDrawing } from '../BaseDrawing'
import { geometry } from '../geometry'
import { ExtendedLinePaneView } from './ExtendedLinePaneView'
import type { IChartApi, Point } from 'lightweight-charts'
import type { DrawingOptions } from '@engine/drawings/types'

const EXTENDED_LINE_SCHEMA = {
  inputs: [{ type: 'number', key: 'line-width', default: 2 }],
  style: [{ type: 'color', key: 'line-color', default: 'rgb(0, 188, 212)' }]
} as const satisfies StudySchema

export type ExtendedLineParams = InferStudyValues<typeof EXTENDED_LINE_SCHEMA.inputs> &
  InferStudyValues<typeof EXTENDED_LINE_SCHEMA.style>

export class ExtendedLine extends BaseDrawing {
  static readonly ikey = 'extended-line' as const
  static readonly points = 2
  #params: ExtendedLineParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(EXTENDED_LINE_SCHEMA.inputs, EXTENDED_LINE_SCHEMA.style, options?.params)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(EXTENDED_LINE_SCHEMA.inputs, EXTENDED_LINE_SCHEMA.style, params)
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: ExtendedLine.ikey,
      schema: EXTENDED_LINE_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport) {
      return [new ExtendedLinePaneView(viewport, this.anchors, this.anchorsVisible, this.#params)]
    }

    return []
  }

  override checkTap(point: Point) {
    const viewport = this.getViewport()
    if (!viewport) return false

    const p1 = viewport.anchorToPoint(this.anchors[0])
    const p2 = viewport.anchorToPoint(this.anchors[1])

    if (!p1 || !p2) return false

    return geometry.distanceToLine(point, p1, p2) < ExtendedLine.hitThreashold
  }
}

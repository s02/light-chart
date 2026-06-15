import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { geometry } from '@engine/drawings/geometry'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import type { DrawingOptions } from '@engine/drawings/types'
import type { IChartApi, Point } from 'lightweight-charts'
import { ArrowMarkerPaneView } from './ArrowMarkerPaneView'

const ARROW_MARKER_SCHEMA = {
  text: [
    { type: 'string', key: 'textarea', default: '' },
    { type: 'number', key: 'font-size', default: 12 },
    { type: 'color', key: 'text-color', default: 'rgb(255 255 255)' }
  ],
  style: [{ type: 'color', key: 'line-color', default: 'rgb(255, 152, 0)' }]
} as const satisfies StudySchema

export type ArrowMarkerParams = InferStudyValues<typeof ARROW_MARKER_SCHEMA.text> &
  InferStudyValues<typeof ARROW_MARKER_SCHEMA.style>

export class ArrowMarker extends BaseDrawing {
  static readonly ikey = 'arrow-marker' as const
  static readonly points = 2

  #params: ArrowMarkerParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(ARROW_MARKER_SCHEMA.text, ARROW_MARKER_SCHEMA.style, options?.params)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(ARROW_MARKER_SCHEMA.text, ARROW_MARKER_SCHEMA.style, params)
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: ArrowMarker.ikey,
      schema: ARROW_MARKER_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (!viewport || this.anchors.length !== 2) return []

    return [new ArrowMarkerPaneView(viewport, this.anchors, this.anchorsVisible, this.#params)]
  }

  override checkTap(point: Point): boolean {
    const viewport = this.getViewport()
    if (!viewport || this.anchors.length !== 2) return false

    const p1 = viewport.anchorToPoint(this.anchors[0])
    const p2 = viewport.anchorToPoint(this.anchors[1])
    if (!p1 || !p2) return false

    return geometry.distanceToLineSegment(point, p1, p2) < ArrowMarker.hitThreashold
  }
}

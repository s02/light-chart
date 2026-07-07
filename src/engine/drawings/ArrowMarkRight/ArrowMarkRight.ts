import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { ArrowMarkRightPaneView } from '@engine/drawings/ArrowMarkRight/ArrowMarkRightPaneView'
import {
  ArrowHeadWidth,
  ArrowHeadHeight,
  ArrowTailHeight
} from '@engine/drawings/ArrowMarkRight/ArrowMarkRightRenderer'
import { textLabelBounds } from '@engine/primitives/text-label'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import type { DrawingOptions } from '@engine/drawings/types'
import type { IChartApi, Point } from 'lightweight-charts'

const ARROW_MARK_RIGHT_SCHEMA = {
  inputs: [],
  text: [
    { type: 'string', key: 'text', default: '' },
    { type: 'number', key: 'font-size', default: 12 },
    { type: 'color', key: 'text-color', default: 'rgb(41 98 255)' }
  ],
  style: [{ type: 'color', key: 'fill-color', default: 'rgb(41 98 255)', fastPanel: true }]
} as const satisfies StudySchema

export type ArrowMarkRightParams = InferStudyValues<typeof ARROW_MARK_RIGHT_SCHEMA.text> &
  InferStudyValues<typeof ARROW_MARK_RIGHT_SCHEMA.style>

export class ArrowMarkRight extends BaseDrawing {
  static readonly ikey = 'arrow-mark-right' as const
  static readonly points = 1

  #params: ArrowMarkRightParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(
      ARROW_MARK_RIGHT_SCHEMA.text,
      ARROW_MARK_RIGHT_SCHEMA.style,
      ARROW_MARK_RIGHT_SCHEMA.text,
      options?.params
    )
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(
      ARROW_MARK_RIGHT_SCHEMA.text,
      ARROW_MARK_RIGHT_SCHEMA.style,
      ARROW_MARK_RIGHT_SCHEMA.text,
      params
    )
    if (this.requestUpdate) this.requestUpdate()
  }

  override getSchema() {
    return {
      ikey: ArrowMarkRight.ikey,
      schema: ARROW_MARK_RIGHT_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport && this.anchors.length === 1) {
      return [new ArrowMarkRightPaneView(viewport, this.anchors[0], this.#params)]
    }
    return []
  }

  override checkTap(point: Point): boolean {
    const viewport = this.getViewport()
    if (!viewport) return false
    const p = viewport.anchorToPoint(this.anchors[0])
    if (!p) return false

    const { width, height } = textLabelBounds(this.#params.text, this.#params['font-size'])
    const pad = ArrowMarkRight.hitThreashold
    const totalW = ArrowHeadHeight + ArrowTailHeight
    const halfH = Math.max(ArrowHeadWidth / 2, height / 2)

    return (
      point.x >= p.x - 4 - width - pad &&
      point.x <= p.x + totalW + pad &&
      point.y >= p.y - halfH - pad &&
      point.y <= p.y + halfH + pad
    )
  }
}

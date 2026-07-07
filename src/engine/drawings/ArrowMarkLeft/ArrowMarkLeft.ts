import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { ArrowMarkLeftPaneView } from '@engine/drawings/ArrowMarkLeft/ArrowMarkLeftPaneView'
import { ArrowHeadWidth, ArrowHeadHeight, ArrowTailHeight } from '@engine/drawings/ArrowMarkLeft/ArrowMarkLeftRenderer'
import { textLabelBounds } from '@engine/primitives/text-label'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import type { DrawingOptions } from '@engine/drawings/types'
import type { IChartApi, Point } from 'lightweight-charts'

const ARROW_MARK_LEFT_SCHEMA = {
  text: [
    { type: 'string', key: 'text', default: '' },
    { type: 'number', key: 'font-size', default: 12 },
    { type: 'color', key: 'text-color', default: 'rgb(41 98 255)' }
  ],
  inputs: [],
  style: [{ type: 'color', key: 'fill-color', default: 'rgb(41 98 255)', fastPanel: true }]
} as const satisfies StudySchema

export type ArrowMarkLeftParams = InferStudyValues<typeof ARROW_MARK_LEFT_SCHEMA.text> &
  InferStudyValues<typeof ARROW_MARK_LEFT_SCHEMA.style>

export class ArrowMarkLeft extends BaseDrawing {
  static readonly ikey = 'arrow-mark-left' as const
  static readonly points = 1

  #params: ArrowMarkLeftParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(
      ARROW_MARK_LEFT_SCHEMA.text,
      ARROW_MARK_LEFT_SCHEMA.style,
      ARROW_MARK_LEFT_SCHEMA.text,
      options?.params
    )
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(
      ARROW_MARK_LEFT_SCHEMA.text,
      ARROW_MARK_LEFT_SCHEMA.style,
      ARROW_MARK_LEFT_SCHEMA.text,
      params
    )
    if (this.requestUpdate) this.requestUpdate()
  }

  override getSchema() {
    return {
      ikey: ArrowMarkLeft.ikey,
      schema: ARROW_MARK_LEFT_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport && this.anchors.length === 1) {
      return [new ArrowMarkLeftPaneView(viewport, this.anchors[0], this.#params)]
    }
    return []
  }

  override checkTap(point: Point): boolean {
    const viewport = this.getViewport()
    if (!viewport) return false
    const p = viewport.anchorToPoint(this.anchors[0])
    if (!p) return false

    const { width, height } = textLabelBounds(this.#params.text, this.#params['font-size'])
    const pad = ArrowMarkLeft.hitThreashold
    const totalW = ArrowHeadHeight + ArrowTailHeight
    const halfH = Math.max(ArrowHeadWidth / 2, height / 2)

    return (
      point.x >= p.x - totalW - pad &&
      point.x <= p.x + 4 + width + pad &&
      point.y >= p.y - halfH - pad &&
      point.y <= p.y + halfH + pad
    )
  }
}

import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { ArrowMarkUpPaneView } from '@engine/drawings/ArrowMarkUp/ArrowMarkUpPaneView'
import { ArrowHeadWidth, ArrowHeadHeight, ArrowTailHeight } from '@engine/drawings/ArrowMarkUp/ArrowMarkUpRenderer'
import { textLabelBounds } from '@engine/primitives/text-label'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import type { DrawingOptions } from '@engine/drawings/types'
import type { IChartApi, Point } from 'lightweight-charts'

const ARROW_MARK_UP_SCHEMA = {
  text: [
    { type: 'string', key: 'textarea', default: '' },
    { type: 'number', key: 'font-size', default: 12 },
    { type: 'color', key: 'text-color', default: 'rgb(38 166 154)' }
  ],
  style: [{ type: 'color', key: 'fill', default: 'rgb(38 166 154)' }]
} as const satisfies StudySchema

export type ArrowMarkUpParams = InferStudyValues<typeof ARROW_MARK_UP_SCHEMA.text> &
  InferStudyValues<typeof ARROW_MARK_UP_SCHEMA.style>

export class ArrowMarkUp extends BaseDrawing {
  static readonly ikey = 'arrow-mark-up' as const
  static readonly points = 1

  #params: ArrowMarkUpParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(ARROW_MARK_UP_SCHEMA.text, ARROW_MARK_UP_SCHEMA.style, options?.params)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(ARROW_MARK_UP_SCHEMA.text, ARROW_MARK_UP_SCHEMA.style, params)
    if (this.requestUpdate) this.requestUpdate()
  }

  override getSchema() {
    return {
      ikey: ArrowMarkUp.ikey,
      schema: ARROW_MARK_UP_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport && this.anchors.length === 1) {
      return [new ArrowMarkUpPaneView(viewport, this.anchors[0], this.#params)]
    }
    return []
  }

  override checkTap(point: Point): boolean {
    const viewport = this.getViewport()
    if (!viewport) return false
    const p = viewport.anchorToPoint(this.anchors[0])
    if (!p) return false

    const { width, height } = textLabelBounds(this.#params.textarea, this.#params['font-size'])
    const pad = ArrowMarkUp.hitThreashold
    const totalH = ArrowHeadHeight + ArrowTailHeight
    const halfW = Math.max(ArrowHeadWidth / 2, width / 2)

    return (
      point.x >= p.x - halfW - pad &&
      point.x <= p.x + halfW + pad &&
      point.y >= p.y - totalH - pad &&
      point.y <= p.y + 4 + height + pad
    )
  }
}

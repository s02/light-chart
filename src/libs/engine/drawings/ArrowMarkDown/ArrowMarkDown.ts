import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { ArrowMarkDownPaneView } from '@engine/drawings/ArrowMarkDown/ArrowMarkDownPaneView'
import { ArrowHeadWidth, ArrowHeadHeight, ArrowTailHeight } from '@engine/drawings/ArrowMarkDown/ArrowMarkDownRenderer'
import { textLabelBounds } from '@engine/primitives/text-label'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import type { DrawingOptions } from '@engine/drawings/types'
import type { IChartApi, Point } from 'lightweight-charts'

const ARROW_MARK_DOWN_SCHEMA = {
  text: [
    { type: 'string', key: 'textarea', default: '' },
    { type: 'number', key: 'font-size', default: 12 },
    { type: 'color', key: 'text-color', default: 'rgb(239 83 80)' }
  ],
  style: [{ type: 'color', key: 'fill', default: 'rgb(239 83 80)' }]
} as const satisfies StudySchema

export type ArrowMarkDownParams = InferStudyValues<typeof ARROW_MARK_DOWN_SCHEMA.text> &
  InferStudyValues<typeof ARROW_MARK_DOWN_SCHEMA.style>

export class ArrowMarkDown extends BaseDrawing {
  static readonly ikey = 'arrow-mark-down' as const
  static readonly points = 1

  #params: ArrowMarkDownParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(ARROW_MARK_DOWN_SCHEMA.text, ARROW_MARK_DOWN_SCHEMA.style, options?.params)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(ARROW_MARK_DOWN_SCHEMA.text, ARROW_MARK_DOWN_SCHEMA.style, params)
    if (this.requestUpdate) this.requestUpdate()
  }

  override getSchema() {
    return {
      ikey: ArrowMarkDown.ikey,
      schema: ARROW_MARK_DOWN_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport && this.anchors.length === 1) {
      return [new ArrowMarkDownPaneView(viewport, this.anchors[0], this.#params)]
    }
    return []
  }

  override checkTap(point: Point): boolean {
    const viewport = this.getViewport()
    if (!viewport) return false
    const p = viewport.anchorToPoint(this.anchors[0])
    if (!p) return false

    const { width, height } = textLabelBounds(this.#params.textarea, this.#params['font-size'])
    const pad = ArrowMarkDown.hitThreashold
    const totalH = ArrowHeadHeight + ArrowTailHeight
    const halfW = Math.max(ArrowHeadWidth / 2, width / 2)

    return (
      point.x >= p.x - halfW - pad &&
      point.x <= p.x + halfW + pad &&
      point.y >= p.y - pad &&
      point.y <= p.y + totalH + 4 + height + pad
    )
  }
}

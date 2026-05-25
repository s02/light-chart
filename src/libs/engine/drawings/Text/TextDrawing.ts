import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { TextPaneView } from '@engine/drawings/Text/TextPaneView'
import { textLabelBounds } from '@engine/primitives/text-label'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import type { DrawingName, DrawingOptions } from '@engine/drawings/types'
import type { IChartApi, Point } from 'lightweight-charts'

const TEXT_SCHEMA = {
  inputs: [{ type: 'string', key: 'text', default: 'Text' }],
  style: [
    { type: 'color', key: 'text-color', default: 'rgb(255 255 255)' },
    { type: 'color', key: 'fill', default: 'rgb(41 98 255)' },
    { type: 'number', key: 'font-size', default: 16 }
  ]
} as const satisfies StudySchema

export type TextParams = InferStudyValues<typeof TEXT_SCHEMA.inputs> & InferStudyValues<typeof TEXT_SCHEMA.style>

export class TextDrawing extends BaseDrawing {
  static readonly ikey: DrawingName = 'text'
  static readonly points = 1

  #params: TextParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(TEXT_SCHEMA.inputs, TEXT_SCHEMA.style, options?.params)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(TEXT_SCHEMA.inputs, TEXT_SCHEMA.style, params)
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: TextDrawing.ikey,
      schema: TEXT_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport && this.anchors.length === 1) {
      return [new TextPaneView(viewport, this.anchors[0], this.anchorsVisible, this.#params)]
    }
    return []
  }

  override checkTap(point: Point): boolean {
    const viewport = this.getViewport()
    if (!viewport || !this.anchors.length) {
      return false
    }

    const p = viewport.anchorToPoint(this.anchors[0])
    if (!p) return false

    const { width, height } = textLabelBounds(this.#params.text, this.#params['font-size'])
    const pad = TextDrawing.hitThreashold

    return point.x >= p.x - pad && point.x <= p.x + width + pad && point.y >= p.y - pad && point.y <= p.y + height + pad
  }
}

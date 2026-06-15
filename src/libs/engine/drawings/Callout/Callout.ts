import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { geometry } from '@engine/drawings/geometry'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import type { DrawingOptions } from '@engine/drawings/types'
import type { IChartApi, Point } from 'lightweight-charts'
import { CalloutPaneView } from './CalloutPaneView'

const CALLOUT_SCHEMA = {
  text: [
    { type: 'string', key: 'textarea', default: 'Text' },
    { type: 'number', key: 'font-size', default: 12 },
    { type: 'color', key: 'text-color', default: 'rgb(255 255 255)' }
  ],
  style: [{ type: 'color', key: 'fill', default: 'rgb(0, 188, 212)' }]
} as const satisfies StudySchema

export type CalloutParams = InferStudyValues<typeof CALLOUT_SCHEMA.text> & InferStudyValues<typeof CALLOUT_SCHEMA.style>

export class Callout extends BaseDrawing {
  static readonly ikey = 'callout' as const
  static readonly points = 2

  #params: CalloutParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(CALLOUT_SCHEMA.text, CALLOUT_SCHEMA.style, options?.params)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(CALLOUT_SCHEMA.text, CALLOUT_SCHEMA.style, params)
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: Callout.ikey,
      schema: CALLOUT_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (!viewport || this.anchors.length !== 2) return []

    return [new CalloutPaneView(viewport, this.anchors[0], this.anchors[1], this.anchorsVisible, this.#params)]
  }

  override checkTap(point: Point): boolean {
    const viewport = this.getViewport()
    if (!viewport || this.anchors.length !== 2) return false

    const tip = viewport.anchorToPoint(this.anchors[0])
    const bubble = viewport.anchorToPoint(this.anchors[1])
    if (!tip || !bubble) return false

    const fontSize = this.#params['font-size']
    const charWidth = fontSize * 0.6
    const maxWidth = 250
    const availableWidth = maxWidth - 12
    const estimatedLines = Math.max(1, Math.ceil((this.#params.textarea.length * charWidth) / availableWidth))
    const bubbleWidth = Math.min(this.#params.textarea.length * charWidth + 12, maxWidth)
    const bubbleHeight = fontSize * estimatedLines + 8
    const pad = Callout.hitThreashold

    const inBubble =
      point.x >= bubble.x - bubbleWidth / 2 - pad &&
      point.x <= bubble.x + bubbleWidth / 2 + pad &&
      point.y >= bubble.y - bubbleHeight / 2 - pad &&
      point.y <= bubble.y + bubbleHeight / 2 + pad

    if (inBubble) return true

    return geometry.distanceToLineSegment(point, tip, bubble) < Callout.hitThreashold
  }
}

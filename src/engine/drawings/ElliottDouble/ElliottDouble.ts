import { AxisHighlighterLabelView } from '@engine/drawings/AxisHighlighter/AxisHighlighterLabelView'
import { AxisHighlighterPaneView } from '@engine/drawings/AxisHighlighter/AxisHighlighterPaneView'
import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { ElliottDoublePaneView } from '@engine/drawings/ElliottDouble/ElliottDoublePaneView'
import { geometry } from '@engine/drawings/geometry'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import type { DrawingOptions } from '@engine/drawings/types'
import type { IChartApi, Point } from 'lightweight-charts'

const ELLIOTT_DOUBLE_SCHEMA = {
  text: [],
  inputs: [],
  style: [
    { type: 'line-width', key: 'line-width', default: 1, fastPanel: true },
    { type: 'number', key: 'font-size', default: 16, fastPanel: true },
    { type: 'line-color', key: 'line-color', default: 'rgb(33 150 243)', fastPanel: true },
    { type: 'color', key: 'text-color', default: 'rgb(33 150 243)', fastPanel: true }
  ]
} as const satisfies StudySchema

export type ElliottDoubleParams = InferStudyValues<typeof ELLIOTT_DOUBLE_SCHEMA.inputs> &
  InferStudyValues<typeof ELLIOTT_DOUBLE_SCHEMA.style>

export class ElliottDouble extends BaseDrawing {
  static readonly ikey = 'elliott-double' as const
  static readonly points = 4

  #params: ElliottDoubleParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(
      ELLIOTT_DOUBLE_SCHEMA.inputs,
      ELLIOTT_DOUBLE_SCHEMA.style,
      ELLIOTT_DOUBLE_SCHEMA.text,
      options?.params
    )
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(
      ELLIOTT_DOUBLE_SCHEMA.inputs,
      ELLIOTT_DOUBLE_SCHEMA.style,
      ELLIOTT_DOUBLE_SCHEMA.text,
      params
    )
    if (this.requestUpdate) this.requestUpdate()
  }

  override getSchema() {
    return {
      ikey: ElliottDouble.ikey,
      schema: ELLIOTT_DOUBLE_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport && this.anchors.length > 0) {
      return [new ElliottDoublePaneView(viewport, this.anchors, this.anchorsVisible, this.#params)]
    }
    return []
  }

  priceAxisPaneViews() {
    if (!this.anchorsVisible) {
      return []
    }

    const viewport = this.getViewport()
    if (viewport) {
      return [new AxisHighlighterPaneView(viewport, this.anchors, { vertical: true })]
    }

    return []
  }

  timeAxisPaneViews() {
    if (!this.anchorsVisible) {
      return []
    }

    const viewport = this.getViewport()
    if (viewport) {
      return [new AxisHighlighterPaneView(viewport, this.anchors, { vertical: false })]
    }

    return []
  }

  priceAxisViews() {
    return this.#axisLabelViews(true)
  }

  timeAxisViews() {
    return this.#axisLabelViews(false)
  }

  #axisLabelViews(vertical: boolean) {
    if (!this.anchorsVisible) {
      return []
    }

    const viewport = this.getViewport()
    if (!viewport || this.anchors.length < 2) {
      return []
    }

    return this.anchors.map((anchor) => new AxisHighlighterLabelView(viewport, anchor, { vertical }))
  }

  override checkTap(point: Point): boolean {
    const viewport = this.getViewport()
    if (!viewport) return false

    for (let i = 0; i < this.anchors.length - 1; i++) {
      const start = viewport.anchorToPoint(this.anchors[i])
      const end = viewport.anchorToPoint(this.anchors[i + 1])
      if (start && end && geometry.distanceToLineSegment(point, start, end) < ElliottDouble.hitThreashold) {
        return true
      }
    }

    return false
  }
}

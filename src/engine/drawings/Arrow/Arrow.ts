import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import { BaseDrawing } from '../BaseDrawing'
import { geometry } from '../geometry'
import { ArrowPaneView } from './ArrowPaneView'
import type { IChartApi, Point } from 'lightweight-charts'
import type { DrawingOptions } from '@engine/drawings/types'
import { AxisHighlighterPaneView } from '@engine/drawings/AxisHighlighter/AxisHighlighterPaneView'
import { AxisHighlighterLabelView } from '@engine/drawings/AxisHighlighter/AxisHighlighterLabelView'

const ARROW_SCHEMA = {
  text: [],
  inputs: [],
  style: [
    { type: 'line-color', key: 'line-color', default: 'rgb(103 58 183)', fastPanel: true },
    { type: 'line-width', key: 'line-width', default: 2, fastPanel: true }
  ]
} as const satisfies StudySchema

export type ArrowParams = InferStudyValues<typeof ARROW_SCHEMA.inputs> & InferStudyValues<typeof ARROW_SCHEMA.style>

export class Arrow extends BaseDrawing {
  static readonly ikey = 'arrow' as const
  static readonly points = 2
  #params: ArrowParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(ARROW_SCHEMA.inputs, ARROW_SCHEMA.style, ARROW_SCHEMA.text, options?.params)
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

    return [
      new AxisHighlighterLabelView(viewport, this.anchors[0], { vertical }),
      new AxisHighlighterLabelView(viewport, this.anchors[1], { vertical })
    ]
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(ARROW_SCHEMA.inputs, ARROW_SCHEMA.style, ARROW_SCHEMA.text, params)
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

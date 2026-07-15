import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import { BaseDrawing } from '../BaseDrawing'
import { geometry } from '../geometry'
import { ExtendedLinePaneView } from './ExtendedLinePaneView'
import type { IChartApi, Point } from 'lightweight-charts'
import type { DrawingOptions } from '@engine/drawings/types'
import { AxisHighlighterPaneView } from '@engine/drawings/AxisHighlighter/AxisHighlighterPaneView'
import { AxisHighlighterLabelView } from '@engine/drawings/AxisHighlighter/AxisHighlighterLabelView'

const EXTENDED_LINE_SCHEMA = {
  text: [
    { type: 'string', key: 'text', default: '' },
    { type: 'number', key: 'font-size', default: 12 },
    { type: 'color', key: 'text-color', default: 'rgb(41 98 255)' }
  ],
  inputs: [],
  style: [
    { type: 'color', key: 'line-color', default: 'rgb(41 98 255)', fastPanel: true },
    { type: 'line-width', key: 'line-width', default: 2, fastPanel: true }
  ]
} as const satisfies StudySchema

export type ExtendedLineParams = InferStudyValues<typeof EXTENDED_LINE_SCHEMA.inputs> &
  InferStudyValues<typeof EXTENDED_LINE_SCHEMA.style> &
  InferStudyValues<typeof EXTENDED_LINE_SCHEMA.text>

export class ExtendedLine extends BaseDrawing {
  static readonly ikey = 'extended-line' as const
  static readonly points = 2
  #params: ExtendedLineParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(
      EXTENDED_LINE_SCHEMA.inputs,
      EXTENDED_LINE_SCHEMA.style,
      EXTENDED_LINE_SCHEMA.text,
      options?.params
    )
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(
      EXTENDED_LINE_SCHEMA.inputs,
      EXTENDED_LINE_SCHEMA.style,
      EXTENDED_LINE_SCHEMA.text,
      params
    )
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

import { AxisHighlighterLabelView } from '@engine/drawings/AxisHighlighter/AxisHighlighterLabelView'
import { AxisHighlighterPaneView } from '@engine/drawings/AxisHighlighter/AxisHighlighterPaneView'
import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { FibRetracementPaneView } from '@engine/drawings/FibRetracement/FibRetracementPaneView'
import type { DrawingOptions } from '@engine/drawings/types'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import type { IChartApi, Point } from 'lightweight-charts'

const FIB_SCHEMA = {
  text: [],
  inputs: [],
  style: [
    { type: 'line-width', key: 'fr-line-width', default: 2, fastPanel: true },
    { type: 'font-size', key: 'font-size', default: 12 },
    { type: 'line-color', key: 'fr-trend-line', default: 'rgb(128 128 128)' },

    { type: 'number', key: 'fr-c0-ratio', default: 0, step: 0.1 },
    { type: 'color', key: 'fr-c0-color', default: 'rgb(128 128 128 / 20%)' },

    { type: 'number', key: 'fr-c1-ratio', default: 0.236, step: 0.1 },
    { type: 'color', key: 'fr-c1-color', default: 'rgb(242 54 69 / 20%)' },

    { type: 'number', key: 'fr-c2-ratio', default: 0.383, step: 0.1 },
    { type: 'color', key: 'fr-c2-color', default: 'rgb(255 152 0 / 20%)' },

    { type: 'number', key: 'fr-c3-ratio', default: 0.5, step: 0.1 },
    { type: 'color', key: 'fr-c3-color', default: 'rgb(76 175 80 / 20%)' },

    { type: 'number', key: 'fr-c4-ratio', default: 0.618, step: 0.1 },
    { type: 'color', key: 'fr-c4-color', default: 'rgb(8 153 129 / 20%)' },

    { type: 'number', key: 'fr-c5-ratio', default: 0.786, step: 0.1 },
    { type: 'color', key: 'fr-c5-color', default: 'rgb(0 188 212 / 20%)' },

    { type: 'number', key: 'fr-c6-ratio', default: 1, step: 0.1 },
    { type: 'color', key: 'fr-c6-color', default: 'rgb(128 128 128 / 20%)' },

    { type: 'number', key: 'fr-c7-ratio', default: 1.618, step: 0.1 },
    { type: 'color', key: 'fr-c7-color', default: 'rgb(41 98 255 / 20%)' },

    { type: 'number', key: 'fr-c8-ratio', default: 2.618, step: 0.1 },
    { type: 'color', key: 'fr-c8-color', default: 'rgb(242 54 69 / 20%)' },

    { type: 'number', key: 'fr-c9-ratio', default: 3.618, step: 0.1 },
    { type: 'color', key: 'fr-c9-color', default: 'rgb(156 39 176 / 20%)' },

    { type: 'number', key: 'fr-c10-ratio', default: 4.236, step: 0.1 },
    { type: 'color', key: 'fr-c10-color', default: 'rgb(233 30 99 / 20%)' }
  ]
} as const satisfies StudySchema

export type FibRetracementParams = InferStudyValues<typeof FIB_SCHEMA.inputs> &
  InferStudyValues<typeof FIB_SCHEMA.style>

export class FibRetracement extends BaseDrawing {
  static readonly ikey = 'fib-retracement' as const
  static readonly points = 2
  #params: FibRetracementParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(FIB_SCHEMA.inputs, FIB_SCHEMA.style, FIB_SCHEMA.text, options?.params)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(FIB_SCHEMA.inputs, FIB_SCHEMA.style, FIB_SCHEMA.text, params)
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: FibRetracement.ikey,
      schema: FIB_SCHEMA,
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
      return [new FibRetracementPaneView(viewport, this.anchors, this.anchorsVisible, this.#params)]
    }
    return []
  }

  override checkTap(point: Point) {
    const viewport = this.getViewport()
    if (!viewport || this.anchors.length < 2) return false

    const p1 = viewport.anchorToPoint(this.anchors[0])
    const p2 = viewport.anchorToPoint(this.anchors[1])

    if (!p1 || !p2) return false

    const minX = Math.min(p1.x, p2.x)
    const maxX = Math.max(p1.x, p2.x)
    const minY = Math.min(p1.y, p2.y)
    const maxY = Math.max(p1.y, p2.y)

    return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
  }
}

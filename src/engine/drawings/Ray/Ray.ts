import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import { BaseDrawing } from '../BaseDrawing'
import { geometry } from '../geometry'
import { RayPaneView } from './RayPaneView'
import type { IChartApi, Point } from 'lightweight-charts'
import type { DrawingOptions } from '@engine/drawings/types'
import { AxisHighlighterPaneView } from '@engine/drawings/AxisHighlighter/AxisHighlighterPaneView'
import { AxisHighlighterLabelView } from '@engine/drawings/AxisHighlighter/AxisHighlighterLabelView'

const RAY_SCHEMA = {
  text: [
    { type: 'string', key: 'text', default: '' },
    { type: 'number', key: 'font-size', default: 12 },
    { type: 'color', key: 'text-color', default: 'rgb(41 98 255)' }
  ],
  inputs: [],
  style: [
    { type: 'color', key: 'line-color', default: 'rgb(41 98 255)', fastPanel: true },
    { type: 'line-width', key: 'line-width', default: 2, fastPanel: true },
    { type: 'line-style', key: 'line-style', default: 'solid', fastPanel: true }
  ]
} as const satisfies StudySchema

export type RayParams = InferStudyValues<typeof RAY_SCHEMA.style> & InferStudyValues<typeof RAY_SCHEMA.text>

export class Ray extends BaseDrawing {
  static readonly ikey = 'ray' as const
  static readonly points = 2
  #params: RayParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(RAY_SCHEMA.inputs, RAY_SCHEMA.style, RAY_SCHEMA.text, options?.params)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(RAY_SCHEMA.inputs, RAY_SCHEMA.style, RAY_SCHEMA.text, params)
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: Ray.ikey,
      schema: RAY_SCHEMA,
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
      return [new RayPaneView(viewport, this.anchors, this.anchorsVisible, this.#params)]
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

    const distance = geometry.distanceToRay(point, start, end)
    return distance < Ray.hitThreashold
  }
}

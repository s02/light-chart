import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { BrushPaneView } from '@engine/drawings/Brush/BrushPaneView'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import { geometry } from '../geometry'
import { POINTS_MODE } from '@engine/points'
import type { IChartApi, Point } from 'lightweight-charts'
import type { DrawingOptions } from '@engine/drawings/types'

const DEFAULTS = {
  'line-width': 3,
  'line-color': 'rgb(255 152 0)',
  'fill-color': 'rgb(255 152 0 / 10%)'
}

const BRUSH_SCHEMA = {
  text: [],
  inputs: [],
  style: [
    { type: 'line-width', key: 'line-width', default: DEFAULTS['line-width'], fastPanel: true },
    { type: 'line-color', key: 'line-color', default: DEFAULTS['line-color'], fastPanel: true },
    { type: 'color', key: 'fill-color', default: DEFAULTS['fill-color'], fastPanel: true }
  ]
} as const satisfies StudySchema

export type BrushParams = InferStudyValues<typeof BRUSH_SCHEMA.inputs> &
  InferStudyValues<typeof BRUSH_SCHEMA.style> &
  InferStudyValues<typeof BRUSH_SCHEMA.text>

export class Brush extends BaseDrawing {
  static readonly ikey = 'brush' as const
  static readonly points = POINTS_MODE.BRUSH
  #params: BrushParams

  constructor(chart: IChartApi, options: DrawingOptions = { params: DEFAULTS }) {
    super(chart)
    this.#params = resolveStudyParams(BRUSH_SCHEMA.inputs, BRUSH_SCHEMA.style, BRUSH_SCHEMA.text, options.params)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(BRUSH_SCHEMA.inputs, BRUSH_SCHEMA.style, BRUSH_SCHEMA.text, params)

    DEFAULTS['line-color'] = this.#params['line-color']
    DEFAULTS['line-width'] = this.#params['line-width']
    DEFAULTS['fill-color'] = this.#params['fill-color']

    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: Brush.ikey,
      schema: BRUSH_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport) {
      return [new BrushPaneView(viewport, this.anchors, this.#params)]
    }
    return []
  }

  override checkAnchor(_point: Point) {
    return null
  }

  override checkTap(point: Point) {
    const viewport = this.getViewport()
    if (!viewport) return false

    for (let i = 0; i < this.anchors.length - 1; i++) {
      const start = viewport.anchorToPoint(this.anchors[i])
      const end = viewport.anchorToPoint(this.anchors[i + 1])

      if (start && end && geometry.distanceToLineSegment(point, start, end) < Brush.hitThreashold) {
        return true
      }
    }

    return false
  }
}

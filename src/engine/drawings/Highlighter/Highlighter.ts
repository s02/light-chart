import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { HighlighterPaneView } from '@engine/drawings/Highlighter/HighlighterPaneView'
import { geometry } from '../geometry'
import { POINTS_MODE } from '@engine/points'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import type { IChartApi, Point } from 'lightweight-charts'
import type { DrawingOptions } from '@engine/drawings/types'

const DEFAULTS = {
  'brush-width': 20,
  'line-color': 'rgb(255 255 255 / 25%)'
}

const HIGHLIGHTER_SCHEMA = {
  text: [],
  inputs: [],
  style: [
    { type: 'number', key: 'brush-width', default: DEFAULTS['brush-width'], fastPanel: true },
    { type: 'color', key: 'line-color', default: DEFAULTS['line-color'], fastPanel: true }
  ]
} as const satisfies StudySchema

export type HighlighterParams = InferStudyValues<typeof HIGHLIGHTER_SCHEMA.inputs> &
  InferStudyValues<typeof HIGHLIGHTER_SCHEMA.style> &
  InferStudyValues<typeof HIGHLIGHTER_SCHEMA.text>

export class Highlighter extends BaseDrawing {
  static readonly ikey = 'highlighter' as const
  static readonly points = POINTS_MODE.BRUSH
  #params: HighlighterParams

  constructor(chart: IChartApi, options: DrawingOptions = { params: DEFAULTS }) {
    super(chart)
    this.#params = resolveStudyParams(
      HIGHLIGHTER_SCHEMA.inputs,
      HIGHLIGHTER_SCHEMA.style,
      HIGHLIGHTER_SCHEMA.text,
      options?.params
    )
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(
      HIGHLIGHTER_SCHEMA.inputs,
      HIGHLIGHTER_SCHEMA.style,
      HIGHLIGHTER_SCHEMA.text,
      params
    )

    DEFAULTS['line-color'] = this.#params['line-color']
    DEFAULTS['brush-width'] = this.#params['brush-width']

    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: Highlighter.ikey,
      schema: HIGHLIGHTER_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport) {
      return [new HighlighterPaneView(viewport, this.anchors, this.#params)]
    }
    return []
  }

  override checkAnchor(_point: Point) {
    return null
  }

  override checkTap(point: Point) {
    const viewport = this.getViewport()
    if (!viewport) return false

    const hitRadius = this.#params['brush-width'] / 2 + Highlighter.hitThreashold

    for (let i = 0; i < this.anchors.length - 1; i++) {
      const start = viewport.anchorToPoint(this.anchors[i])
      const end = viewport.anchorToPoint(this.anchors[i + 1])

      if (start && end && geometry.distanceToLineSegment(point, start, end) < hitRadius) {
        return true
      }
    }

    return false
  }
}

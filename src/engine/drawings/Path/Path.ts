import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import { BaseDrawing } from '../BaseDrawing'
import { geometry } from '../geometry'
import { PathPaneView } from './PathPaneView'
import type { IChartApi, Point } from 'lightweight-charts'
import type { DrawingOptions } from '@engine/drawings/types'
import { POINTS_MODE } from '@engine/points'

const PATH_SCHEMA = {
  text: [],
  inputs: [],
  style: [
    { type: 'line-width', key: 'line-width', default: 2, fastPanel: true },
    { type: 'line-color', key: 'line-color', default: 'rgb(233 30 99)', fastPanel: true },
    { type: 'line-style', key: 'line-style', default: 'solid', fastPanel: true }
  ]
} as const satisfies StudySchema

export type PathParams = InferStudyValues<typeof PATH_SCHEMA.inputs> &
  InferStudyValues<typeof PATH_SCHEMA.style> &
  InferStudyValues<typeof PATH_SCHEMA.text>

export class Path extends BaseDrawing {
  static readonly ikey = 'path' as const
  static readonly points = POINTS_MODE.INF
  #params: PathParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(PATH_SCHEMA.inputs, PATH_SCHEMA.style, PATH_SCHEMA.text, options?.params)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(PATH_SCHEMA.inputs, PATH_SCHEMA.style, PATH_SCHEMA.text, params)
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: Path.ikey,
      schema: PATH_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport) {
      return [new PathPaneView(viewport, this.anchors, this.anchorsVisible, this.#params)]
    }

    return []
  }

  override checkTap(point: Point) {
    const viewport = this.getViewport()
    if (!viewport) {
      return false
    }

    for (let i = 0; i < this.anchors.length - 1; i++) {
      const start = viewport.anchorToPoint(this.anchors[i])
      const end = viewport.anchorToPoint(this.anchors[i + 1])

      if (start && end) {
        const distance = geometry.distanceToLineSegment(point, start, end)
        if (distance < Path.hitThreashold) {
          return true
        }
      }
    }

    return false
  }
}

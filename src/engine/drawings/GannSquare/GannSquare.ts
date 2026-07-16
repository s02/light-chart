import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { GannSquarePaneView } from '@engine/drawings/GannSquare/GannSquarePaneView'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import { geometry } from '../geometry'
import type { IChartApi, Point } from 'lightweight-charts'
import type { DrawingOptions } from '@engine/drawings/types'

const GANN_SQUARE_SCHEMA = {
  text: [],
  inputs: [{ type: 'number', key: 'divisions', default: 5 }],
  style: [
    { type: 'line-width', key: 'line-width', default: 2, fastPanel: true },
    { type: 'line-color', key: 'line-color', default: 'rgb(0, 188, 212)', fastPanel: true },

    { type: 'color', key: 'arc-1-0-color', default: 'rgb(255 152 0 / 20%)' },
    { type: 'color', key: 'arc-1-1-color', default: 'rgb(255 152 0 / 20%)' },
    { type: 'color', key: 'arc-1.5-0-color', default: 'rgb(255 152 0 / 20%)' },
    { type: 'color', key: 'arc-2-0-color', default: 'rgb(0 188 212 / 20%)' },
    { type: 'color', key: 'arc-2-1-color', default: 'rgb(0 188 212 / 20%)' },
    { type: 'color', key: 'arc-3-0-color', default: 'rgb(76 175 80 / 20%)' },
    { type: 'color', key: 'arc-3-1-color', default: 'rgb(76 175 80 / 20%)' },
    { type: 'color', key: 'arc-4-0-color', default: 'rgb(8 153 129 / 20%)' },
    { type: 'color', key: 'arc-4-1-color', default: 'rgb(8 153 129 / 20%)' },
    { type: 'color', key: 'arc-5-0-color', default: 'rgb(41 98 255 / 20%)' },
    { type: 'color', key: 'arc-5-1-color', default: 'rgb(41 98 255 / 20%)' }
  ]
} as const satisfies StudySchema

export type GannSquareParams = InferStudyValues<typeof GANN_SQUARE_SCHEMA.inputs> &
  InferStudyValues<typeof GANN_SQUARE_SCHEMA.style>

export class GannSquare extends BaseDrawing {
  static readonly ikey = 'gann-square' as const
  static readonly points = 2
  #params: GannSquareParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(
      GANN_SQUARE_SCHEMA.inputs,
      GANN_SQUARE_SCHEMA.style,
      GANN_SQUARE_SCHEMA.text,
      options?.params
    )
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(
      GANN_SQUARE_SCHEMA.inputs,
      GANN_SQUARE_SCHEMA.style,
      GANN_SQUARE_SCHEMA.text,
      params
    )
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: GannSquare.ikey,
      schema: GANN_SQUARE_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport) {
      return new GannSquarePaneView(viewport, this.anchors, this.anchorsVisible, this.#params).views()
    }
    return []
  }

  override checkTap(point: Point) {
    const viewport = this.getViewport()
    if (!viewport) {
      return false
    }

    const p1 = viewport.anchorToPoint(this.anchors[0])
    const p2 = viewport.anchorToPoint(this.anchors[1])

    if (!p1 || !p2) {
      return false
    }

    const minX = Math.min(p1.x, p2.x)
    const maxX = Math.max(p1.x, p2.x)
    const minY = Math.min(p1.y, p2.y)
    const maxY = Math.max(p1.y, p2.y)

    const tl = { x: minX, y: minY } as Point
    const tr = { x: maxX, y: minY } as Point
    const br = { x: maxX, y: maxY } as Point
    const bl = { x: minX, y: maxY } as Point

    return (
      geometry.distanceToLineSegment(point, tl, tr) < GannSquare.hitThreashold ||
      geometry.distanceToLineSegment(point, tr, br) < GannSquare.hitThreashold ||
      geometry.distanceToLineSegment(point, br, bl) < GannSquare.hitThreashold ||
      geometry.distanceToLineSegment(point, bl, tl) < GannSquare.hitThreashold
    )
  }
}

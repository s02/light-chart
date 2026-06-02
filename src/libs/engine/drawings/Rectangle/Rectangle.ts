import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { RectanglePaneView } from '@engine/drawings/Rectangle/RectanglePaneView'
import type { DrawingOptions } from '@engine/drawings/types'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import type { IChartApi, Point } from 'lightweight-charts'
import { geometry } from '../geometry'

const RECTANGLE_SCHEMA = {
  inputs: [{ type: 'number', key: 'line-width', default: 1 }],
  style: [
    { type: 'color', key: 'line-color', default: 'rgb(41 98 255)' },
    { type: 'color', key: 'fill', default: 'rgb(41 98 255 / 0%)' }
  ]
} as const satisfies StudySchema

export type RectangleParams = InferStudyValues<typeof RECTANGLE_SCHEMA.inputs> &
  InferStudyValues<typeof RECTANGLE_SCHEMA.style>

export class Rectangle extends BaseDrawing {
  static readonly ikey = 'rectangle' as const
  static readonly points = 2
  #params: RectangleParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(RECTANGLE_SCHEMA.inputs, RECTANGLE_SCHEMA.style, options?.params)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(RECTANGLE_SCHEMA.inputs, RECTANGLE_SCHEMA.style, params)
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: Rectangle.ikey,
      schema: RECTANGLE_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport) {
      return [new RectanglePaneView(viewport, this.anchors, this.anchorsVisible, this.#params)]
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
      geometry.distanceToLineSegment(point, tl, tr) < Rectangle.hitThreashold ||
      geometry.distanceToLineSegment(point, tr, br) < Rectangle.hitThreashold ||
      geometry.distanceToLineSegment(point, br, bl) < Rectangle.hitThreashold ||
      geometry.distanceToLineSegment(point, bl, tl) < Rectangle.hitThreashold
    )
  }
}

import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { RectanglePaneView } from '@engine/drawings/Rectangle/RectanglePaneView'
import type { DrawingOptions } from '@engine/drawings/types'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import type { IChartApi, Point } from 'lightweight-charts'
import { geometry } from '../geometry'

const RECTANGLE_SCHEMA = {
  text: [
    { type: 'string', key: 'text', default: '' },
    { type: 'number', key: 'font-size', default: 12 },
    { type: 'color', key: 'text-color', default: 'rgb(41 98 255)' }
  ],
  inputs: [],
  style: [
    { type: 'line-width', key: 'line-width', default: 2, fastPanel: true },
    { type: 'line-style', key: 'line-style', default: 'solid', fastPanel: true },
    { type: 'line-color', key: 'line-color', default: 'rgb(41 98 255)', fastPanel: true },
    { type: 'color', key: 'fill-color', default: 'rgb(41 98 255 / 15%)', fastPanel: true }
  ]
} as const satisfies StudySchema

export type RectangleParams = InferStudyValues<typeof RECTANGLE_SCHEMA.inputs> &
  InferStudyValues<typeof RECTANGLE_SCHEMA.style> &
  InferStudyValues<typeof RECTANGLE_SCHEMA.text>

export class Rectangle extends BaseDrawing {
  static readonly ikey = 'rectangle' as const
  static readonly points = 2
  #params: RectangleParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(
      RECTANGLE_SCHEMA.inputs,
      RECTANGLE_SCHEMA.style,
      RECTANGLE_SCHEMA.text,
      options?.params
    )
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(RECTANGLE_SCHEMA.inputs, RECTANGLE_SCHEMA.style, RECTANGLE_SCHEMA.text, params)
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

import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { GannSquarePaneView } from '@engine/drawings/GannSquare/GannSquarePaneView'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import { geometry } from '../geometry'
import type { IChartApi, Point } from 'lightweight-charts'
import type { DrawingOptions } from '@engine/drawings/types'

const GANN_SQUARE_SCHEMA = {
  text: [],
  inputs: [],
  style: [
    { type: 'line-width', key: 'line-width', default: 2, fastPanel: true },
    { type: 'color', key: 'font-color', default: 'rgb(255 255 255)' },
    { type: 'font-size', key: 'font-size', default: 12 },
    { type: 'bool', key: 'labels-visible', default: true },

    { type: 'color', key: 'square-0-color', default: 'rgb(128 128 128)' },
    { type: 'bool', key: 'square-0-visible', default: true },
    { type: 'color', key: 'square-1-color', default: 'rgb(255 152 0)' },
    { type: 'bool', key: 'square-1-visible', default: true },
    { type: 'color', key: 'square-2-color', default: 'rgb(0 188 212)' },
    { type: 'bool', key: 'square-2-visible', default: true },
    { type: 'color', key: 'square-3-color', default: 'rgb(76 175 80)' },
    { type: 'bool', key: 'square-3-visible', default: true },
    { type: 'color', key: 'square-4-color', default: 'rgb(8 153 129)' },
    { type: 'bool', key: 'square-4-visible', default: true },
    { type: 'color', key: 'square-5-color', default: 'rgb(128 128 128)' },
    { type: 'bool', key: 'square-5-visible', default: true },

    { type: 'color', key: 'fan-8x1-color', default: 'rgb(179 157 219)' },
    { type: 'bool', key: 'fan-8x1-visible', default: false },
    { type: 'color', key: 'fan-5x1-color', default: 'rgb(242 54 69)' },
    { type: 'bool', key: 'fan-5x1-visible', default: false },
    { type: 'color', key: 'fan-4x1-color', default: 'rgb(128 128 128)' },
    { type: 'bool', key: 'fan-4x1-visible', default: false },
    { type: 'color', key: 'fan-3x1-color', default: 'rgb(255 152 0)' },
    { type: 'bool', key: 'fan-3x1-visible', default: false },
    { type: 'color', key: 'fan-2x1-color', default: 'rgb(0 188 212)' },
    { type: 'bool', key: 'fan-2x1-visible', default: true },
    { type: 'color', key: 'fan-1x1-color', default: 'rgb(76 175 80)' },
    { type: 'bool', key: 'fan-1x1-visible', default: true },
    { type: 'color', key: 'fan-1x2-color', default: 'rgb(8 153 129)' },
    { type: 'bool', key: 'fan-1x2-visible', default: true },
    { type: 'color', key: 'fan-1x3-color', default: 'rgb(8 153 129)' },
    { type: 'bool', key: 'fan-1x3-visible', default: false },
    { type: 'color', key: 'fan-1x4-color', default: 'rgb(41 98 255)' },
    { type: 'bool', key: 'fan-1x4-visible', default: false },
    { type: 'color', key: 'fan-1x5-color', default: 'rgb(149 117 205)' },
    { type: 'bool', key: 'fan-1x5-visible', default: false },
    { type: 'color', key: 'fan-1x6-color', default: 'rgb(149 117 205)' },
    { type: 'bool', key: 'fan-1x6-visible', default: false },

    { type: 'color', key: 'arc-1x0-color', default: 'rgb(255 152 0 / 20%)' },
    { type: 'bool', key: 'arc-1x0-visible', default: true },
    { type: 'color', key: 'arc-1x1-color', default: 'rgb(255 152 0 / 20%)' },
    { type: 'bool', key: 'arc-1x1-visible', default: true },
    { type: 'color', key: 'arc-1.5x0-color', default: 'rgb(255 152 0 / 20%)' },
    { type: 'bool', key: 'arc-1.5x0-visible', default: true },
    { type: 'color', key: 'arc-2x0-color', default: 'rgb(0 188 212 / 20%)' },
    { type: 'bool', key: 'arc-2x0-visible', default: true },
    { type: 'color', key: 'arc-2x1-color', default: 'rgb(0 188 212 / 20%)' },
    { type: 'bool', key: 'arc-2x1-visible', default: true },
    { type: 'color', key: 'arc-3x0-color', default: 'rgb(76 175 80 / 20%)' },
    { type: 'bool', key: 'arc-3x0-visible', default: true },
    { type: 'color', key: 'arc-3x1-color', default: 'rgb(76 175 80 / 20%)' },
    { type: 'bool', key: 'arc-3x1-visible', default: true },
    { type: 'color', key: 'arc-4x0-color', default: 'rgb(8 153 129 / 20%)' },
    { type: 'bool', key: 'arc-4x0-visible', default: true },
    { type: 'color', key: 'arc-4x1-color', default: 'rgb(8 153 129 / 20%)' },
    { type: 'bool', key: 'arc-4x1-visible', default: true },
    { type: 'color', key: 'arc-5x0-color', default: 'rgb(41 98 255 / 20%)' },
    { type: 'bool', key: 'arc-5x0-visible', default: true },
    { type: 'color', key: 'arc-5x1-color', default: 'rgb(41 98 255 / 20%)' },
    { type: 'bool', key: 'arc-5x1-visible', default: true }
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

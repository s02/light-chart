import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { PriceRangePaneView } from '@engine/drawings/PriceRange/PriceRangePaneView'
import type { DrawingOptions } from '@engine/drawings/types'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import type { IChartApi, Point } from 'lightweight-charts'
import { geometry } from '../geometry'

const PRICE_RANGE_SCHEMA = {
  text: [],
  inputs: [],
  style: [
    { type: 'number', key: 'line-width', default: 2, fastPanel: true },
    { type: 'color', key: 'line-color', default: 'rgb(76 175 80)', fastPanel: true },
    { type: 'color', key: 'fill-color', default: 'rgb(76 175 80 / 15%)', fastPanel: true },

    { type: 'line-width', key: 'border-width', default: 1 },
    { type: 'color', key: 'border-color', default: 'rgb(76 175 80 / 0%)' },
    { type: 'font-size', key: 'label-font-size', default: 12 },
    { type: 'color', key: 'label-color', default: 'rgb(255 255 255)' },
    { type: 'color', key: 'label-fill', default: 'rgb(76 175 80)' }
  ]
} as const satisfies StudySchema

export type PriceRangeParams = InferStudyValues<typeof PRICE_RANGE_SCHEMA.inputs> &
  InferStudyValues<typeof PRICE_RANGE_SCHEMA.style>

export class PriceRange extends BaseDrawing {
  static readonly ikey = 'price-range' as const
  static readonly points = 2
  #params: PriceRangeParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)

    this.#params = resolveStudyParams(
      PRICE_RANGE_SCHEMA.inputs,
      PRICE_RANGE_SCHEMA.style,
      PRICE_RANGE_SCHEMA.text,
      options?.params
    )
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(
      PRICE_RANGE_SCHEMA.inputs,
      PRICE_RANGE_SCHEMA.style,
      PRICE_RANGE_SCHEMA.text,
      params
    )
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: PriceRange.ikey,
      schema: PRICE_RANGE_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport) {
      return [new PriceRangePaneView(viewport, this.anchors, this.anchorsVisible, this.#params)]
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
      geometry.distanceToLineSegment(point, tl, tr) < PriceRange.hitThreashold ||
      geometry.distanceToLineSegment(point, tr, br) < PriceRange.hitThreashold ||
      geometry.distanceToLineSegment(point, br, bl) < PriceRange.hitThreashold ||
      geometry.distanceToLineSegment(point, bl, tl) < PriceRange.hitThreashold
    )
  }
}

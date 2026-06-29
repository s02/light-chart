import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { FibRetracementPaneView } from '@engine/drawings/FibRetracement/FibRetracementPaneView'
import type { DrawingOptions } from '@engine/drawings/types'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import type { IChartApi, Point } from 'lightweight-charts'
import { geometry } from '../geometry'

export const FIB_LEVELS = [
  { ratio: 0, key: 'c0' as const, label: '0' },
  { ratio: 0.236, key: 'c236' as const, label: '0.236' },
  { ratio: 0.383, key: 'c383' as const, label: '0.383' },
  { ratio: 0.5, key: 'c500' as const, label: '0.5' },
  { ratio: 0.618, key: 'c618' as const, label: '0.618' },
  { ratio: 0.786, key: 'c786' as const, label: '0.786' },
  { ratio: 1, key: 'c1000' as const, label: '1' },
  { ratio: 1.618, key: 'c1618' as const, label: '1.618' },
  { ratio: 2.618, key: 'c2618' as const, label: '2.618' },
  { ratio: 3.618, key: 'c3618' as const, label: '3.618' },
  { ratio: 4.236, key: 'c4236' as const, label: '4.236' }
] as const

const FIB_SCHEMA = {
  text: [],
  inputs: [],
  style: [
    { type: 'color', key: 'fill-color', default: 'rgb(255 241 118 / 10%)', fastPanel: true },
    { type: 'color', key: 'line-color', default: 'rgb(255 241 118)', fastPanel: true },
    { type: 'number', key: 'font-size', default: 12 },
    { type: 'color', key: 'c0', default: 'rgb(255 241 118)' },
    { type: 'color', key: 'c236', default: 'rgb(255 241 118)' },
    { type: 'color', key: 'c383', default: 'rgb(255 241 118)' },
    { type: 'color', key: 'c500', default: 'rgb(255 241 118)' },
    { type: 'color', key: 'c618', default: 'rgb(255 241 118)' },
    { type: 'color', key: 'c786', default: 'rgb(255 241 118)' },
    { type: 'color', key: 'c1000', default: 'rgb(255 241 118)' },
    { type: 'color', key: 'c1618', default: 'rgb(255 241 118)' },
    { type: 'color', key: 'c2618', default: 'rgb(255 241 118)' },
    { type: 'color', key: 'c3618', default: 'rgb(255 241 118)' },
    { type: 'color', key: 'c4236', default: 'rgb(255 241 118)' }
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

    if (point.x < minX - FibRetracement.hitThreashold || point.x > maxX + FibRetracement.hitThreashold) {
      return false
    }

    if (geometry.distanceToLineSegment(point, p1, p2) < FibRetracement.hitThreashold) return true

    for (const { ratio } of FIB_LEVELS) {
      const levelY = p2.y + ratio * (p1.y - p2.y)
      if (Math.abs(point.y - levelY) <= FibRetracement.hitThreashold) return true
    }

    return false
  }
}

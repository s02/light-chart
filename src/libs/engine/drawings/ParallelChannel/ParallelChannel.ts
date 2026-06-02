import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { geometry } from '@engine/drawings/geometry'
import { ParallelChannelPaneView } from '@engine/drawings/ParallelChannel/ParallelChannelPaneView'
import type { Anchor, DrawingOptions } from '@engine/drawings/types'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import type { IChartApi, Point } from 'lightweight-charts'

const PARALLEL_CHANNEL_SCHEMA = {
  inputs: [{ type: 'number', key: 'line-width', default: 1 }],
  style: [
    { type: 'color', key: 'line-color', default: 'rgb(41 98 255)' },
    { type: 'color', key: 'fill', default: 'rgb(41 98 255 / 5%)' }
  ]
} as const satisfies StudySchema

export type ParallelChannelParams = InferStudyValues<typeof PARALLEL_CHANNEL_SCHEMA.inputs> &
  InferStudyValues<typeof PARALLEL_CHANNEL_SCHEMA.style>

export class ParallelChannel extends BaseDrawing {
  static readonly ikey = 'parallel-channel' as const
  static readonly points = 3
  #params: ParallelChannelParams
  #dragStartAnchors: Anchor[] | null = null

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(PARALLEL_CHANNEL_SCHEMA.inputs, PARALLEL_CHANNEL_SCHEMA.style, options?.params)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(PARALLEL_CHANNEL_SCHEMA.inputs, PARALLEL_CHANNEL_SCHEMA.style, params)
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: ParallelChannel.ikey,
      schema: PARALLEL_CHANNEL_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport) {
      return [new ParallelChannelPaneView(viewport, this.anchors, this.anchorsVisible, this.#params)]
    }
    return []
  }

  override startDrag() {
    this.#dragStartAnchors = [...this.anchors]
    super.startDrag()
  }

  override stopDrag() {
    this.#dragStartAnchors = null
    super.stopDrag()
  }

  override setAnchors(anchors: Anchor[]) {
    if (anchors.length < 3) {
      super.setAnchors(anchors)
      return
    }

    const viewport = this.getViewport()
    if (!viewport) {
      return
    }

    if (anchors.length < 4) {
      const delta = {
        price: anchors[2].price - anchors[1].price,
        length: anchors[2].y - anchors[1].y
      }

      const bl = this.#createLine([anchors[0], anchors[1]], delta)

      if (bl) {
        super.setAnchors([anchors[0], anchors[1], ...bl])
      }

      return
    }

    const delta = {
      price: this.anchors[2].price - this.anchors[0].price,
      length: this.anchors[2].y - anchors[0].y
    }

    const i = this.#findChangedAnchor(anchors)

    if (i == 0 || i == 1) {
      const bl = this.#createLine([anchors[0], anchors[1]], delta)

      if (bl) {
        super.setAnchors([anchors[0], anchors[1], ...bl])
      }

      return
    }

    if (i == 2 || i == 3) {
      const tl = this.#createLine([anchors[2], anchors[3]], { price: delta.price * -1, length: delta.length * -1 })

      if (tl) {
        super.setAnchors([...tl, anchors[2], anchors[3]])
      }

      return
    }

    return
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
        if (distance < ParallelChannel.hitThreashold) {
          return true
        }
      }
    }

    return false
  }

  #createLine(anchors: Anchor[], delta: { price: number; length: number }) {
    const viewport = this.getViewport()
    if (!viewport) {
      return false
    }

    const a2 = { time: anchors[0].time, price: anchors[0].price + delta.price }
    const a3 = { time: anchors[1].time, price: anchors[1].price + delta.price }

    const p2 = viewport.anchorToPoint(a2)
    const p3 = viewport.anchorToPoint(a3)

    if (p2 && p3) {
      return [
        { ...p2, ...a2 },
        { ...p3, ...a3 }
      ]
    }

    return null
  }

  #findChangedAnchor(anchors: Anchor[]) {
    const base = this.#dragStartAnchors ?? this.anchors
    for (let i = 0; i < anchors.length; i++) {
      if (anchors[i].price !== base[i].price || anchors[i].time !== base[i].time) {
        return i
      }
    }

    return -1
  }
}

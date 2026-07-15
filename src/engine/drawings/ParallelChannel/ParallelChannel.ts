import { AxisHighlighterLabelView } from '@engine/drawings/AxisHighlighter/AxisHighlighterLabelView'
import { AxisHighlighterPaneView } from '@engine/drawings/AxisHighlighter/AxisHighlighterPaneView'
import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { geometry } from '@engine/drawings/geometry'
import { ParallelChannelPaneView } from '@engine/drawings/ParallelChannel/ParallelChannelPaneView'
import type { DrawingOptions } from '@engine/drawings/types'
import type { Anchor } from '@engine/points'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import type { IChartApi, Point } from 'lightweight-charts'

// TODO: Добавить дополнительные anchors, чтобы увеличивать-уменьшать высоту
// TODO: Добавить настройку для расширения влево или вправо

const PARALLEL_CHANNEL_SCHEMA = {
  text: [],
  inputs: [],
  style: [
    { type: 'color', key: 'line-color', default: 'rgb(156 39 176)', fastPanel: true },
    { type: 'color', key: 'fill-color', default: 'rgb(156 39 176 / 5%)', fastPanel: true },
    { type: 'line-width', key: 'line-width', default: 2, fastPanel: true }
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
    this.#params = resolveStudyParams(
      PARALLEL_CHANNEL_SCHEMA.inputs,
      PARALLEL_CHANNEL_SCHEMA.style,
      PARALLEL_CHANNEL_SCHEMA.text,
      options?.params
    )
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(
      PARALLEL_CHANNEL_SCHEMA.inputs,
      PARALLEL_CHANNEL_SCHEMA.style,
      PARALLEL_CHANNEL_SCHEMA.text,
      params
    )
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

  priceAxisPaneViews() {
    if (!this.anchorsVisible) {
      return []
    }

    const viewport = this.getViewport()
    if (viewport) {
      return [new AxisHighlighterPaneView(viewport, this.anchors, { vertical: true })]
    }

    return []
  }

  timeAxisPaneViews() {
    if (!this.anchorsVisible) {
      return []
    }

    const viewport = this.getViewport()
    if (viewport) {
      return [new AxisHighlighterPaneView(viewport, this.anchors, { vertical: false })]
    }

    return []
  }

  priceAxisViews() {
    return this.#axisLabelViews(true)
  }

  timeAxisViews() {
    return this.#axisLabelViews(false)
  }

  #axisLabelViews(vertical: boolean) {
    if (!this.anchorsVisible) {
      return []
    }

    const viewport = this.getViewport()
    if (!viewport || this.anchors.length < 2) {
      return []
    }

    if (vertical) {
      return this.anchors.map((anchor) => new AxisHighlighterLabelView(viewport, anchor, { vertical }))
    }

    return [
      new AxisHighlighterLabelView(viewport, this.anchors[0], { vertical }),
      new AxisHighlighterLabelView(viewport, this.anchors[1], { vertical })
    ]
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

    if (this.anchors.length < 4) {
      const start = viewport.anchorToPoint(this.anchors[0])
      const end = viewport.anchorToPoint(this.anchors[1])
      if (start && end) {
        return geometry.distanceToLineSegment(point, start, end) < ParallelChannel.hitThreashold
      }
      return false
    }

    const p0 = viewport.anchorToPoint(this.anchors[0])
    const p1 = viewport.anchorToPoint(this.anchors[1])
    const p2 = viewport.anchorToPoint(this.anchors[2])
    const p3 = viewport.anchorToPoint(this.anchors[3])

    if (!p0 || !p1 || !p2 || !p3) {
      return false
    }

    return geometry.pointInPolygon(point, [p0, p1, p3, p2])
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

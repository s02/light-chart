import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { EmojiPaneView } from '@engine/drawings/EmojiDrawing/EmojiPaneView'
import { geometry } from '../geometry'
import { resolveStudyParams } from '@engine/schema'
import type { InferStudyValues, StudyParams, StudySchema } from '@engine/schema'
import type { DrawingOptions } from '@engine/drawings/types'
import type { IChartApi, Point } from 'lightweight-charts'
import type { Anchor } from '@engine/points'

const EMOJI_SCHEMA = {
  inputs: [{ type: 'string', key: 'emoji', default: '🚀' }],
  style: []
} as const satisfies StudySchema

export type EmojiParams = InferStudyValues<typeof EMOJI_SCHEMA.inputs> & InferStudyValues<typeof EMOJI_SCHEMA.style>

function emojiToTwemojiUrl(emoji: string): string {
  const codePoints = [...emoji]
    .map((c) => c.codePointAt(0)!.toString(16).toLowerCase())
    .filter((cp) => cp !== 'fe0f')
    .join('-')

  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codePoints}.svg`
}

export class EmojiDrawing extends BaseDrawing {
  static readonly ikey = 'emoji' as const
  static readonly points = 2
  #params: EmojiParams
  #image: HTMLImageElement | null = null
  #loadedEmoji = ''
  #rotation = 0
  #rotationInitialized = false

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(EMOJI_SCHEMA.inputs, EMOJI_SCHEMA.style, options?.params)
    this.#fetchImage(this.#params.emoji)
  }

  override setAnchors(anchors: Anchor[]) {
    if (anchors.length < EmojiDrawing.points) {
      return
    }

    if (this.initialized) {
      this.anchors = anchors
    } else {
      this.anchors = [anchors[0], { time: anchors[1].time, price: anchors[0].price, x: anchors[1].x, y: anchors[0].y }]
    }

    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(EMOJI_SCHEMA.inputs, EMOJI_SCHEMA.style, params)
    this.#fetchImage(this.#params.emoji)
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: EmojiDrawing.ikey,
      schema: EMOJI_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport) {
      if (!this.#rotationInitialized && this.anchors.length >= 2) {
        const center = viewport.anchorToPoint(this.anchors[0])
        const edge = viewport.anchorToPoint(this.anchors[1])
        if (center && edge) {
          this.#rotation = Math.atan2(edge.y - center.y, edge.x - center.x) * (180 / Math.PI)
          this.#rotationInitialized = true
        }
      }
      return [new EmojiPaneView(viewport, this.anchors, this.anchorsVisible, this.#params, this.#image, this.#rotation)]
    }
    return []
  }

  override drag(dx: number, dy: number, anchorIndex: number | null) {
    if (anchorIndex === 1) {
      super.drag(dx, dy, 1)
      const viewport = this.getViewport()
      if (viewport && this.anchors.length >= 2) {
        const center = viewport.anchorToPoint(this.anchors[0])
        const edge = viewport.anchorToPoint(this.anchors[1])
        if (center && edge) {
          this.#rotation = Math.atan2(edge.y - center.y, edge.x - center.x) * (180 / Math.PI)
        }
      }
    } else {
      super.drag(dx, dy, anchorIndex === 0 ? null : anchorIndex)
    }
  }

  override checkTap(point: Point) {
    const viewport = this.getViewport()
    if (!viewport || this.anchors.length < 2) return false

    const center = viewport.anchorToPoint(this.anchors[0])
    const edge = viewport.anchorToPoint(this.anchors[1])

    if (!center || !edge) return false

    const halfSize = geometry.distance(center, edge)
    const angle = this.#rotation * (Math.PI / 180)

    const pdx = point.x - center.x
    const pdy = point.y - center.y
    const cosA = Math.cos(-angle)
    const sinA = Math.sin(-angle)
    const localX = pdx * cosA - pdy * sinA
    const localY = pdx * sinA + pdy * cosA

    return (
      Math.abs(localX) <= halfSize + EmojiDrawing.hitThreashold &&
      Math.abs(localY) <= halfSize + EmojiDrawing.hitThreashold
    )
  }

  #fetchImage(emoji: string) {
    if (this.#loadedEmoji === emoji && this.#image) return

    this.#loadedEmoji = emoji
    this.#image = null

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      if (this.#loadedEmoji !== emoji) return
      this.#image = img
      this.requestUpdate?.()
    }
    img.src = emojiToTwemojiUrl(emoji)
  }
}

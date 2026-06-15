import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import type { DrawingOptions } from '@engine/drawings/types'
import type { IChartApi, ISeriesApi, Point, SeriesType } from 'lightweight-charts'
import { SignPostPaneView } from './SignPostPaneView'

const SIGNPOST_SCHEMA = {
  text: [
    { type: 'string', key: 'textarea', default: 'Text' },
    { type: 'number', key: 'font-size', default: 12 },
    { type: 'color', key: 'text-color', default: 'rgb(255 255 255)' }
  ],
  style: [
    { type: 'color', key: 'fill', default: 'rgb(0, 188, 212)' },
    { type: 'number', key: 'line-width', default: 1 }
  ]
} as const satisfies StudySchema

export type SignPostParams = InferStudyValues<typeof SIGNPOST_SCHEMA.text> &
  InferStudyValues<typeof SIGNPOST_SCHEMA.style>

export class SignPost extends BaseDrawing {
  static readonly ikey = 'sign-post' as const
  static readonly points = 1

  #chart: IChartApi
  #series: ISeriesApi<SeriesType> | undefined
  #params: SignPostParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#chart = chart
    this.#params = resolveStudyParams(SIGNPOST_SCHEMA.text, SIGNPOST_SCHEMA.style, options?.params)
  }

  override attach(series: ISeriesApi<SeriesType>) {
    this.#series = series
    super.attach(series)
  }

  override detach() {
    this.#series = undefined
    super.detach()
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(SIGNPOST_SCHEMA.text, SIGNPOST_SCHEMA.style, params)
    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: SignPost.ikey,
      schema: SIGNPOST_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (!viewport || this.anchors.length !== 1) return []

    const anchor = this.anchors[0]
    const p = viewport.anchorToPoint(anchor)
    if (!p) return []

    const bar = this.#getBarYCoords(p.x)
    if (!bar) return []

    return [new SignPostPaneView(viewport, anchor, this.anchorsVisible, this.#params, bar.barHighY, bar.barLowY)]
  }

  #getBarYCoords(px: number): { barHighY: number; barLowY: number } | null {
    if (!this.#series) return null

    const logical = this.#chart.timeScale().coordinateToLogical(px)
    if (logical === null) return null

    const barData = this.#series.dataByIndex(Math.round(logical))
    if (!barData) return null

    let barHighY: number | null
    let barLowY: number | null

    if ('high' in barData && 'low' in barData) {
      barHighY = this.#series.priceToCoordinate(barData.high as number)
      barLowY = this.#series.priceToCoordinate(barData.low as number)
    } else if ('value' in barData) {
      const y = this.#series.priceToCoordinate(barData.value as number)
      barHighY = y
      barLowY = y
    } else {
      return null
    }

    if (barHighY === null || barLowY === null) return null
    return { barHighY, barLowY }
  }

  override checkTap(point: Point): boolean {
    const viewport = this.getViewport()
    if (!viewport || !this.anchors.length) return false

    const p = viewport.anchorToPoint(this.anchors[0])
    if (!p) return false

    const fontSize = this.#params['font-size']
    const charWidth = fontSize * 0.6
    const maxWidth = 250
    const availableWidth = maxWidth - 12
    const estimatedLines = Math.max(1, Math.ceil((this.#params.textarea.length * charWidth) / availableWidth))
    const bubbleWidth = Math.min(this.#params.textarea.length * charWidth + 12, maxWidth)
    const bubbleHeight = fontSize * estimatedLines + 8
    const pad = SignPost.hitThreashold

    const bar = this.#getBarYCoords(p.x)
    let bubbleTop: number
    let bubbleBottom: number

    if (bar && p.y < bar.barHighY) {
      bubbleTop = p.y - bubbleHeight
      bubbleBottom = p.y
    } else if (bar && p.y > bar.barLowY) {
      bubbleTop = p.y
      bubbleBottom = p.y + bubbleHeight
    } else {
      bubbleTop = p.y - bubbleHeight / 2
      bubbleBottom = p.y + bubbleHeight / 2
    }

    return (
      point.x >= p.x - bubbleWidth / 2 - pad &&
      point.x <= p.x + bubbleWidth / 2 + pad &&
      point.y >= bubbleTop - pad &&
      point.y <= bubbleBottom + pad
    )
  }
}

import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import { RiskRewardPaneView } from '@engine/drawings/RiskReward/RiskRewardPaneView'
import type { DrawingOptions } from '@engine/drawings/types'
import { resolveStudyParams, type InferStudyValues, type StudyParams, type StudySchema } from '@engine/schema'
import type { Anchor } from '@engine/points'
import type { IChartApi, Point } from 'lightweight-charts'

const INITIAL_WIDTH = 300
const INITIAL_HEIGHT = 200

export type RiskRewardSettings = {
  entryPrice: number
  profitPrice: number
  stopPrice: number
  riskSize: number
}

const RISK_REWARD_SCHEMA = {
  inputs: [
    { type: 'number', key: 'account-size', default: 1000 },
    { type: 'number', key: 'lot-size', default: 1 },
    { type: 'number', key: 'risk', default: 250 },
    { type: 'number', key: 'entry-price', default: 0 },
    { type: 'number', key: 'profit-price', default: 0 },
    { type: 'number', key: 'stop-price', default: 0 },
    { type: 'number', key: 'line-width', default: 2 },
    { type: 'number', key: 'border-width', default: 1 }
  ],
  style: [
    { type: 'color', key: 'line-color', default: 'rgb(255 255 255)' },
    { type: 'color', key: 'border-color', default: 'rgb(255 255 255 / 50%)' },
    { type: 'color', key: 'profit-fill', default: 'rgb(76 175 80 / 40%)' },
    { type: 'color', key: 'loss-fill', default: 'rgb(244 67 54 / 40%)' }
  ]
} as const satisfies StudySchema

export type RiskRewardParams = InferStudyValues<typeof RISK_REWARD_SCHEMA.inputs> &
  InferStudyValues<typeof RISK_REWARD_SCHEMA.style>

export class RiskReward extends BaseDrawing {
  static readonly ikey = 'risk-reward' as const
  static readonly points = 1

  #params: RiskRewardParams
  #settings: RiskRewardSettings

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.#params = resolveStudyParams(RISK_REWARD_SCHEMA.inputs, RISK_REWARD_SCHEMA.style, options?.params)
    this.#settings = {
      entryPrice: 0,
      profitPrice: 0,
      stopPrice: 0,
      riskSize: this.#params['risk']
    }
  }

  override setAnchors(anchors: Anchor[]) {
    if (anchors.length === 1) {
      const viewport = this.getViewport()
      if (viewport) {
        const p0 = { x: anchors[0].x as number, y: anchors[0].y as number }
        const halfH = INITIAL_HEIGHT / 2

        const aTopLeft = viewport.pointToAnchor({ x: p0.x, y: p0.y - halfH } as Point)
        const aBottomLeft = viewport.pointToAnchor({ x: p0.x, y: p0.y + halfH } as Point)
        const aMidRight = viewport.pointToAnchor({ x: p0.x + INITIAL_WIDTH, y: p0.y } as Point)

        if (aTopLeft && aBottomLeft && aMidRight) {
          this.#settings.entryPrice = anchors[0].price
          this.#settings.profitPrice = aTopLeft.price
          this.#settings.stopPrice = aBottomLeft.price

          super.setAnchors([anchors[0], aTopLeft, aBottomLeft, aMidRight])
          return
        }
      }
    } else if (anchors.length === 4) {
      this.#settings.entryPrice = anchors[0].price
      this.#settings.profitPrice = anchors[1].price
      this.#settings.stopPrice = anchors[2].price

      super.setAnchors([
        anchors[0],
        { ...anchors[1], time: anchors[0].time, x: anchors[0].x },
        { ...anchors[2], time: anchors[0].time, x: anchors[0].x },
        { ...anchors[3], price: anchors[0].price, y: anchors[0].y }
      ])
      return
    }
    super.setAnchors(anchors)
  }

  override setParams(params: StudyParams) {
    this.#params = resolveStudyParams(RISK_REWARD_SCHEMA.inputs, RISK_REWARD_SCHEMA.style, params)
    this.#settings.riskSize = this.#params['risk']
    if (this.requestUpdate) this.requestUpdate()
  }

  override getSchema() {
    return {
      ikey: RiskReward.ikey,
      schema: RISK_REWARD_SCHEMA,
      params: this.#params
    }
  }

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport && this.anchors.length === 4) {
      return [new RiskRewardPaneView(viewport, this.anchors, this.anchorsVisible, this.#params, this.#settings)]
    }
    return []
  }

  override checkTap(point: Point): boolean {
    const viewport = this.getViewport()
    if (!viewport || this.anchors.length < 4) return false

    const p0 = viewport.anchorToPoint(this.anchors[0])
    const p1 = viewport.anchorToPoint(this.anchors[1])
    const p2 = viewport.anchorToPoint(this.anchors[2])
    const p3 = viewport.anchorToPoint(this.anchors[3])

    if (!p0 || !p1 || !p2 || !p3) return false

    const left = Math.min(p0.x, p3.x)
    const right = Math.max(p0.x, p3.x)
    const top = Math.min(p1.y, p2.y)
    const bottom = Math.max(p1.y, p2.y)

    return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom
  }
}

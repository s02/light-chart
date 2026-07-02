import { BaseDrawing } from '@engine/drawings/BaseDrawing'
import type { DrawingOptions } from '@engine/drawings/types'
import type { Anchor } from '@engine/points'
import { resolveStudyParams, type InferStudyValues, type StudySchema } from '@engine/schema'
import type { IChartApi, Point, Time } from 'lightweight-charts'

//https://www.tradingview.com/support/solutions/43000475660-how-to-use-long-and-short-position-drawing-tools/

const INITIAL_WIDTH = 300
const INITIAL_HEIGHT = 200

export const RISK_REWARD_SCHEMA = {
  text: [],
  inputs: [
    { type: 'number', key: 'rr-account-size', default: 1000 },
    { type: 'number', key: 'rr-risk-size', default: 250 },
    { type: 'number', key: 'rr-lot-size', default: 1 },

    { type: 'number', key: 'rr-entry-price', default: 0, step: 0.01 },
    { type: 'number', key: 'rr-stop-price', default: 0, step: 0.01 },
    { type: 'number', key: 'rr-target-price', default: 0, step: 0.01 }
  ],
  style: [
    { type: 'color', key: 'rr-profit-fill', default: 'rgb(8 153 129 / 20%)' },
    { type: 'color', key: 'rr-loss-fill', default: 'rgb(242 54 69 / 20%)' }
  ]
} as const satisfies StudySchema

export type RiskRewardParams = InferStudyValues<typeof RISK_REWARD_SCHEMA.inputs> &
  InferStudyValues<typeof RISK_REWARD_SCHEMA.style>

export abstract class RiskReward extends BaseDrawing {
  static readonly points = 1
  protected params: RiskRewardParams

  constructor(chart: IChartApi, options?: DrawingOptions) {
    super(chart)
    this.params = resolveStudyParams(
      RISK_REWARD_SCHEMA.inputs,
      RISK_REWARD_SCHEMA.style,
      RISK_REWARD_SCHEMA.text,
      options?.params
    )
  }

  updateAnchorPrice(anchor: Anchor, price: number) {
    const viewport = this.getViewport()
    if (!viewport) {
      return null
    }

    const point = viewport.anchorToPoint({ time: anchor.time, price })
    return {
      ...anchor,
      price,
      ...point
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
          super.setAnchors([anchors[0], aTopLeft, aBottomLeft, aMidRight])
          return
        }
      }
    } else if (anchors.length === 4) {
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

  protected barsBetween(t1: Time, t2: Time) {
    if (!this.series || !this.series.data().length) {
      return []
    }

    return this.series.data().filter((d) => d.time >= t1 && d.time <= t2)
  }
}

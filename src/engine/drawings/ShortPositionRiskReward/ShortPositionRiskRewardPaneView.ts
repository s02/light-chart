import { RiskRewardPaneView } from '@engine/drawings/RiskReward/RiskRewardPaneView'
import { RiskRewardRenderers } from '@engine/drawings/RiskReward/RiskRewardRenderers'
import { RwRectangleRenderer } from '@engine/drawings/RiskReward/RwRectangleRenderer'
import { RwTextRenderer } from '@engine/drawings/RiskReward/RwTextRenderer'
import type { Anchor } from '@engine/points'
import type { Coordinate, IPrimitivePaneView, Point } from 'lightweight-charts'
import type { DrawingViewport, SeriesData } from '@engine/drawings/types'
import type { RiskRewardParams } from '@engine/drawings/RiskReward/RiskReward'
import { helpers } from '@chart/helpers'

const LABEL_GAP = 10

export class ShortPositionRiskRewardPaneView extends RiskRewardPaneView implements IPrimitivePaneView {
  #viewport: DrawingViewport
  #anchors: Anchor[]
  #withDots: boolean

  protected targetPriceOffset: number
  protected stopPriceOffset: number
  protected openPnl: number

  constructor(
    viewport: DrawingViewport,
    anchors: Anchor[],
    withDots: boolean,
    params: RiskRewardParams,
    barsInRange: SeriesData
  ) {
    super(params, barsInRange)
    this.#viewport = viewport
    this.#anchors = anchors
    this.#withDots = withDots

    this.targetPriceOffset = this.params['rr-entry-price'] - this.params['rr-target-price']
    this.stopPriceOffset = this.params['rr-stop-price'] - this.params['rr-entry-price']

    const closePrice = this.closePrice()
    this.openPnl = closePrice ? this.params['rr-entry-price'] - closePrice : 0
  }

  renderer() {
    const p0 = this.#viewport.anchorToPoint(this.#anchors[0])
    const p1 = this.#viewport.anchorToPoint(this.#anchors[1])
    const p2 = this.#viewport.anchorToPoint(this.#anchors[2])
    const p3 = this.#viewport.anchorToPoint(this.#anchors[3])

    if (!p0 || !p1 || !p2 || !p3) {
      return null
    }

    const centerX = ((p0.x + p3.x) / 2) as Coordinate

    return new RiskRewardRenderers(
      new RwRectangleRenderer(p0, p1, p2, p3, this.#withDots, {
        downColor: this.params['rr-profit-fill'],
        upColor: this.params['rr-loss-fill']
      }),
      new RwTextRenderer([this.stopText()], { x: centerX, y: p1.y - LABEL_GAP } as Point, {
        origin: 'bottom',
        color: `rgb(255 255 255)`,
        fill: helpers.parseColor(this.params['rr-loss-fill']).baseColor
      }),
      new RwTextRenderer(this.pnlText(), { x: centerX, y: p0.y + LABEL_GAP } as Point, {
        color: `rgb(255 255 255)`,
        fill:
          this.pnl() > 0
            ? helpers.parseColor(this.params['rr-profit-fill']).baseColor
            : helpers.parseColor(this.params['rr-loss-fill']).baseColor,
        stroke: `rgb(255 255 255)`
      }),

      new RwTextRenderer([this.targetText()], { x: centerX, y: p2.y + LABEL_GAP } as Point, {
        color: `rgb(255 255 255)`,
        fill: helpers.parseColor(this.params['rr-profit-fill']).baseColor
      })
    )
  }

  protected isStopPriceReached() {
    return this.barsInRange.some((bar) => {
      const val = this.barHighValue(bar)
      return val && val >= this.params['rr-stop-price']
    })
  }

  protected isTargetPriceReached() {
    return this.barsInRange.some((bar) => {
      const val = this.barLowValue(bar)
      return val && val <= this.params['rr-target-price']
    })
  }
}

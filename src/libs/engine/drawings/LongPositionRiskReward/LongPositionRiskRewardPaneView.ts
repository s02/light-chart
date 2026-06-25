import { RiskRewardPaneView } from '@engine/drawings/RiskReward/RiskRewardPaneView'
import { RiskRewardRenderers } from '@engine/drawings/RiskReward/RiskRewardRenderers'
import { RwRectangleRenderer } from '@engine/drawings/RiskReward/RwRectangleRenderer'
import { RwTextRenderer } from '@engine/drawings/RiskReward/RwTextRenderer'
import type { Anchor } from '@engine/points'
import type { Coordinate, IPrimitivePaneView, Point } from 'lightweight-charts'
import type { DrawingViewport, SeriesData } from '@engine/drawings/types'
import type { RiskRewardParams } from '@engine/drawings/RiskReward/RiskReward'

const LABEL_GAP = 10

export class LongPositionRiskRewardPaneView extends RiskRewardPaneView implements IPrimitivePaneView {
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

    this.targetPriceOffset = this.params['target-price'] - this.params['entry-price']
    this.stopPriceOffset = this.params['entry-price'] - this.params['stop-price']

    const closePrice = this.closePrice()
    this.openPnl = closePrice ? closePrice - this.params['entry-price'] : 0
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
        upColor: 'rgb(8 153 129 / 20%)',
        downColor: 'rgb(242 54 69 / 20%)'
      }),
      new RwTextRenderer([this.targetText()], { x: centerX, y: p1.y - LABEL_GAP } as Point, {
        origin: 'bottom',
        color: `rgb(255 255 255)`,
        fill: 'rgb(8 153 129)'
      }),
      new RwTextRenderer(this.pnlText(), { x: centerX, y: p0.y + LABEL_GAP } as Point, {
        color: `rgb(255 255 255)`,
        fill: this.pnl() > 0 ? 'rgb(8 153 129)' : 'rgb(242 54 69)',
        stroke: `rgb(255 255 255)`
      }),
      new RwTextRenderer([this.stopText()], { x: centerX, y: p2.y + LABEL_GAP } as Point, {
        color: `rgb(255 255 255)`,
        fill: 'rgb(242 54 69)'
      })
    )
  }

  protected isTargetPriceReached() {
    return this.barsInRange.some((bar) => {
      const val = this.barHighValue(bar)
      return val && val >= this.params['target-price']
    })
  }

  protected isStopPriceReached() {
    return this.barsInRange.some((bar) => {
      const val = this.barLowValue(bar)
      return val && val <= this.params['stop-price']
    })
  }
}

import { RiskRewardRenderer } from '@engine/drawings/RiskReward/RiskRewardRenderer'
import type { RiskRewardParams, RiskRewardSettings } from '@engine/drawings/RiskReward/RiskReward'
import type { DrawingViewport } from '@engine/drawings/types'
import type { Anchor } from '@engine/points'
import type { IPrimitivePaneView, PrimitivePaneViewZOrder } from 'lightweight-charts'

export class RiskRewardPaneView implements IPrimitivePaneView {
  #viewport: DrawingViewport
  #anchors: Anchor[]
  #withDots: boolean
  #params: RiskRewardParams
  #settings: RiskRewardSettings

  constructor(
    viewport: DrawingViewport,
    anchors: Anchor[],
    withDots: boolean,
    params: RiskRewardParams,
    settings: RiskRewardSettings
  ) {
    this.#viewport = viewport
    this.#anchors = anchors
    this.#withDots = withDots
    this.#params = params
    this.#settings = settings
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'normal'
  }

  renderer() {
    const p0 = this.#viewport.anchorToPoint(this.#anchors[0])
    const p1 = this.#viewport.anchorToPoint(this.#anchors[1])
    const p2 = this.#viewport.anchorToPoint(this.#anchors[2])
    const p3 = this.#viewport.anchorToPoint(this.#anchors[3])

    if (!p0 || !p1 || !p2 || !p3) return null

    return new RiskRewardRenderer(p0, p1, p2, p3, this.#withDots, this.#params, this.#settings)
  }
}

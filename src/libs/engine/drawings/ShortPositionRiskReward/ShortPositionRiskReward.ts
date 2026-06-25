import { RISK_REWARD_SCHEMA, RiskReward } from '@engine/drawings/RiskReward/RiskReward'
import { ShortPositionRiskRewardPaneView } from '@engine/drawings/ShortPositionRiskReward/ShortPositionRiskRewardPaneView'

export class ShortPositionRiskReward extends RiskReward {
  static readonly ikey = 'short-risk-reward' as const

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport && this.anchors.length === 4) {
      this.params['entry-price'] = this.anchors[0].price
      this.params['target-price'] = this.anchors[2].price
      this.params['stop-price'] = this.anchors[1].price

      return [
        new ShortPositionRiskRewardPaneView(
          viewport,
          this.anchors,
          this.anchorsVisible,
          this.params,
          this.barsBetween(this.anchors[0].time, this.anchors[3].time)
        )
      ]
    }
    return []
  }

  override getSchema() {
    return {
      ikey: ShortPositionRiskReward.ikey,
      schema: RISK_REWARD_SCHEMA,
      params: this.params
    }
  }
}

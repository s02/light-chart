import { LongPositionRiskRewardPaneView } from '@engine/drawings/LongPositionRiskReward/LongPositionRiskRewardPaneView'
import { RISK_REWARD_SCHEMA, RiskReward } from '@engine/drawings/RiskReward/RiskReward'

export class LongPositionRiskReward extends RiskReward {
  static readonly ikey = 'long-risk-reward' as const

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport && this.anchors.length === 4) {
      this.params['entry-price'] = this.anchors[0].price
      this.params['target-price'] = this.anchors[1].price
      this.params['stop-price'] = this.anchors[2].price

      return [
        new LongPositionRiskRewardPaneView(
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
      ikey: LongPositionRiskReward.ikey,
      schema: RISK_REWARD_SCHEMA,
      params: this.params
    }
  }
}

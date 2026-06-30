import { LongPositionRiskRewardPaneView } from '@engine/drawings/LongPositionRiskReward/LongPositionRiskRewardPaneView'
import { RISK_REWARD_SCHEMA, RiskReward } from '@engine/drawings/RiskReward/RiskReward'
import { resolveStudyParams, type StudyParams } from '@engine/schema'

export class LongPositionRiskReward extends RiskReward {
  static readonly ikey = 'long-risk-reward' as const

  override setParams(params: StudyParams) {
    this.params = resolveStudyParams(
      RISK_REWARD_SCHEMA.inputs,
      RISK_REWARD_SCHEMA.style,
      RISK_REWARD_SCHEMA.text,
      params
    )

    const anchor0 = this.updateAnchorPrice(this.anchors[0], this.params['entry-price'])
    const anchor1 = this.updateAnchorPrice(this.anchors[1], this.params['target-price'])
    const anchor2 = this.updateAnchorPrice(this.anchors[2], this.params['stop-price'])

    if (anchor0 && anchor1 && anchor2) {
      this.setAnchors([anchor0, anchor1, anchor2, this.anchors[3]])
    }

    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

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

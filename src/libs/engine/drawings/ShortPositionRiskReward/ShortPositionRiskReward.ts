import { RISK_REWARD_SCHEMA, RiskReward } from '@engine/drawings/RiskReward/RiskReward'
import { ShortPositionRiskRewardPaneView } from '@engine/drawings/ShortPositionRiskReward/ShortPositionRiskRewardPaneView'
import { resolveStudyParams, type StudyParams } from '@engine/schema'

export class ShortPositionRiskReward extends RiskReward {
  static readonly ikey = 'short-risk-reward' as const

  override paneViews() {
    const viewport = this.getViewport()
    if (viewport && this.anchors.length === 4) {
      this.params['rr-entry-price'] = this.anchors[0].price
      this.params['rr-target-price'] = this.anchors[2].price
      this.params['rr-stop-price'] = this.anchors[1].price

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

  override setParams(params: StudyParams) {
    this.params = resolveStudyParams(
      RISK_REWARD_SCHEMA.inputs,
      RISK_REWARD_SCHEMA.style,
      RISK_REWARD_SCHEMA.text,
      params
    )

    const anchor0 = this.updateAnchorPrice(this.anchors[0], this.params['rr-entry-price'])
    const anchor1 = this.updateAnchorPrice(this.anchors[1], this.params['rr-target-price'])
    const anchor2 = this.updateAnchorPrice(this.anchors[2], this.params['rr-stop-price'])

    if (anchor0 && anchor1 && anchor2) {
      this.setAnchors([anchor0, anchor2, anchor1, this.anchors[3]])
    }

    if (this.requestUpdate) {
      this.requestUpdate()
    }
  }

  override getSchema() {
    return {
      ikey: ShortPositionRiskReward.ikey,
      schema: RISK_REWARD_SCHEMA,
      params: this.params
    }
  }
}

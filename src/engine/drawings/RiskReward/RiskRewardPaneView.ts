import type { RiskRewardParams } from '@engine/drawings/RiskReward/RiskReward'
import type { SeriesData } from '@engine/drawings/types'
import { formatPrice } from '@engine/helpers'
import type { PrimitivePaneViewZOrder } from 'lightweight-charts'

export abstract class RiskRewardPaneView {
  protected params: RiskRewardParams
  protected barsInRange: SeriesData
  protected abstract targetPriceOffset: number
  protected abstract stopPriceOffset: number
  protected abstract openPnl: number

  constructor(params: RiskRewardParams, barsInRange: SeriesData) {
    this.params = params
    this.barsInRange = barsInRange
  }

  protected targetPriceOffsetPercents() {
    return (this.targetPriceOffset / this.params['rr-entry-price']) * 100
  }

  protected stopPriceOffsetPercents() {
    return (this.stopPriceOffset / this.params['rr-entry-price']) * 100
  }

  protected qtyRisk() {
    return this.params['rr-risk-size'] / Math.abs(this.stopPriceOffset) / this.params['rr-lot-size']
  }

  protected targetAmount() {
    return this.params['rr-account-size'] + this.targetPriceOffset * this.qtyRisk() * this.params['rr-lot-size']
  }

  protected stopAmount() {
    return this.params['rr-account-size'] - this.stopPriceOffset * this.qtyRisk() * this.params['rr-lot-size']
  }

  protected riskRatio() {
    return this.targetPriceOffset / this.stopPriceOffset
  }

  protected pnlText() {
    const l1 = `${this.isClosed() ? 'Closed' : 'Open'} P&L: ${formatPrice(this.pnl())}`
    const l2 = `P&L: ${formatPrice(this.pnl())} qty: ${this.qtyRisk().toFixed(0)}`
    const l3 = `Risk/Reward Ratio: ${this.riskRatio().toFixed(2)}`
    return [`${l1}, ${l2}`, l3]
  }

  protected targetText() {
    const l1 = `target: ${formatPrice(this.targetPriceOffset)} (${this.targetPriceOffsetPercents().toFixed(2)}%)`
    const l2 = `Amount: ${this.targetAmount().toFixed(2)}`
    return `${l1}, ${l2}`
  }

  protected stopText() {
    const l1 = `stop: ${formatPrice(this.stopPriceOffset)} (${this.stopPriceOffsetPercents().toFixed(2)}%)`
    const l2 = `Amount: ${this.stopAmount().toFixed(2)}`
    return `${l1}, ${l2}`
  }

  protected profitPnl() {
    return this.targetPriceOffset * this.qtyRisk() * this.params['rr-lot-size']
  }

  protected lossPnl() {
    return this.stopPriceOffset * this.qtyRisk() * this.params['rr-lot-size']
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'normal'
  }

  protected closePrice() {
    const lastBar = this.barsInRange[this.barsInRange.length - 1]
    return this.barValue(lastBar)
  }

  protected abstract isTargetPriceReached(): boolean
  protected abstract isStopPriceReached(): boolean

  protected barHighValue(item: SeriesData[0]) {
    if ('high' in item) {
      return item.high as number
    }

    return this.barValue(item)
  }

  protected barLowValue(item: SeriesData[0]) {
    if ('low' in item) {
      return item.low as number
    }

    return this.barValue(item)
  }

  protected barValue(item: SeriesData[0]) {
    if ('close' in item) {
      return item.close as number
    }

    if ('value' in item) {
      return item.value as number
    }

    return undefined
  }

  protected pnl() {
    if (this.isTargetPriceReached()) {
      return this.targetPriceOffset
    } else if (this.isStopPriceReached()) {
      return -1 * this.stopPriceOffset
    }

    return this.openPnl
  }

  protected isClosed() {
    return this.isStopPriceReached() || this.isTargetPriceReached()
  }
}

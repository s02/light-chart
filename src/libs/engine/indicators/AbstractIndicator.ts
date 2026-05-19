import type { Datafeed, DatafeedResult } from '@engine/types'

export abstract class AbstractIndicator {
  #subscriptionId?: string
  #datafeed: Datafeed
  protected readonly paneIndex: number

  constructor(datafeed: Datafeed, paneIndex = 0) {
    this.#datafeed = datafeed
    this.paneIndex = paneIndex
  }

  protected abstract onData(ev: DatafeedResult): void
  protected abstract removeSeries(): void

  async apply() {
    this.#subscriptionId = await this.#datafeed.subscribe((ev) => this.onData(ev))
  }

  protected reload() {
    if (this.#subscriptionId) {
      this.#datafeed.unsubscribe(this.#subscriptionId)
    }
    this.apply()
  }

  setDatafeed(datafeed: Datafeed) {
    if (this.#subscriptionId) this.#datafeed.unsubscribe(this.#subscriptionId)
    this.#datafeed = datafeed
    this.apply()
  }

  remove() {
    if (this.#subscriptionId !== undefined) {
      this.#datafeed.unsubscribe(this.#subscriptionId)
    }
    this.removeSeries()
  }
}

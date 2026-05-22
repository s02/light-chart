import type { Datafeed, DatafeedDataCallbackFn } from '@engine/types'

export abstract class AbstractIndicator {
  #subscriptionId?: string
  #datafeed: Datafeed
  protected readonly paneIndex: number

  constructor(datafeed: Datafeed, paneIndex = 0) {
    this.#datafeed = datafeed
    this.paneIndex = paneIndex
  }

  protected abstract onData(ev: Parameters<DatafeedDataCallbackFn>[0]): void
  protected abstract removeSeries(): void

  async apply() {
    this.#subscriptionId = await this.#datafeed.subscribeForData((ev) => this.onData(ev))
  }

  setDatafeed(datafeed: Datafeed) {
    if (this.#subscriptionId) {
      this.#datafeed.unsubscribe(this.#subscriptionId)
    }
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

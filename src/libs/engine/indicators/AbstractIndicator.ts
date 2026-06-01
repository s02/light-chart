import type { Datafeed, DatafeedDataCallbackFn } from '@engine/types'
import type { LineData, Time, WhitespaceData } from 'lightweight-charts'

export abstract class AbstractIndicator {
  #subscriptionId?: string
  #datafeed: Datafeed
  #config = {
    preserveGaps: false
  }
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

  protected applyOffset(values: number[], offset: number): number[] {
    const result: number[] = new Array(values.length).fill(NaN)
    for (let i = 0; i < values.length - offset; i++) {
      result[i + offset] = values[i]
    }
    return result
  }

  protected filter(data: LineData<Time>[]): (LineData<Time> | WhitespaceData<Time>)[] {
    if (this.#config.preserveGaps) {
      return data.map((d) => {
        if (d.value == null || Number.isNaN(d.value)) {
          return { time: d.time }
        }

        const pt: LineData<Time> = d
        if (d.color) {
          pt.color = d.color
        }
        return pt
      })
    } else {
      return data.filter((d) => d.value != null && !Number.isNaN(d.value))
    }
  }
}

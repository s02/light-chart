import { RESOLUTION_SETTINGS } from './lib/constants'
import type { Time } from 'lightweight-charts'
import type { AssetSymbol, ChartBar, Datafeed, DatafeedCallbackFn } from './lib/Chart'
import type { ResolutionId } from './lib/constants'
import type { HttpTransport, Quote, WsTransport } from './transport/types'

export class DatafeedAdapter implements Datafeed {
  #http: HttpTransport
  #ws: WsTransport
  #assetSymbol: AssetSymbol
  #resolution: ResolutionId
  #data: ChartBar[] = []
  #quotesBuffer: Quote[] = []
  #earliestDate?: Date
  #subscriptionId?: number
  #loadingBars = false
  #callbacks: Map<number, DatafeedCallbackFn> = new Map()
  #nextCallbackId = 0

  constructor(assetSymbol: AssetSymbol, resolution: ResolutionId, http: HttpTransport, ws: WsTransport) {
    this.#http = http
    this.#ws = ws
    this.#resolution = resolution
    this.#assetSymbol = assetSymbol
  }

  getAssetSymbol() {
    return this.#assetSymbol
  }

  getResolutionId() {
    return this.#resolution
  }

  unsubscribe(id: number) {
    this.#callbacks.delete(id)

    if (this.#callbacks.size === 0 && this.#subscriptionId !== undefined) {
      this.#ws.unsubscribeFromQuotes(this.#assetSymbol.id, this.#subscriptionId)
      this.#subscriptionId = undefined
    }
  }

  async subscribe(callback: DatafeedCallbackFn): Promise<number> {
    const id = ++this.#nextCallbackId
    this.#callbacks.set(id, callback)

    if (this.#subscriptionId !== undefined) {
      callback({ type: 'set', data: this.#data })
      return id
    }

    let firstQuoteReceived = false
    let dataLoaded = false

    this.#subscriptionId = await this.#ws.subscribeToQuotes(this.#assetSymbol.id, async (quote) => {
      if (dataLoaded) {
        const bars = this.#update(quote)
        this.#fireCallbacks({ type: 'update', data: bars })
      } else {
        this.#quotesBuffer.push(quote)
      }

      if (!firstQuoteReceived) {
        firstQuoteReceived = true
        this.#earliestDate = new Date(quote.timestamp * 1000)
        await this.#loadBars()

        this.#quotesBuffer.forEach((quote) => {
          this.#update(quote)
        })
        dataLoaded = true
        this.#fireCallbacks({ type: 'set', data: this.#data })
      }
    })

    return id
  }

  async loadHistory() {
    if (this.#loadingBars) {
      return
    }

    this.#loadingBars = true
    await this.#loadBars()
    this.#fireCallbacks({ type: 'set', data: this.#data })
    this.#loadingBars = false
  }

  #fireCallbacks(event: { type: 'set' | 'update'; data: ChartBar[] }) {
    this.#callbacks.forEach((cb) => cb(event))
  }

  getBars() {
    return this.#data
  }

  async #loadBars(countBack: number = 300) {
    if (!this.#earliestDate) {
      throw 'Setup last date first'
    }

    const divider = RESOLUTION_SETTINGS[this.#resolution].seconds
    const detalization = RESOLUTION_SETTINGS[this.#resolution].name
    const toSeconds = this.#earliestDate.getTime() / 1000
    const fromSeconds = toSeconds - divider * countBack

    const period = {
      from: new Date(fromSeconds * 1000),
      to: new Date(toSeconds * 1000)
    }

    const result = await this.#http.getBars(
      this.#assetSymbol.id,
      period.from.toISOString(),
      period.to.toISOString(),
      detalization
    )

    const data = result.map((bar) => ({
      ...bar,
      time: (new Date(bar.time).getTime() / 1000) as Time,
      value: bar.close
    }))

    this.#smoothify(data)
    this.#merge(data)

    this.#earliestDate = period.from
  }

  #update(quote: Quote) {
    const result: ChartBar[] = []

    if (!this.#data.length) {
      throw 'Nothing to update'
    }

    const lastBar = this.#data[this.#data.length - 1]
    this.#updateChartBar(lastBar, quote)
    result.push(lastBar)

    const tick = quote.timestamp % RESOLUTION_SETTINGS[this.#resolution].seconds

    if (tick === 0) {
      const bar = this.#createChartBar(quote)
      this.#data.push(bar)
      result.push(bar)
    }

    return result
  }

  #updateChartBar(bar: ChartBar, quote: Quote) {
    bar.low = Math.min(bar.low, quote.value)
    bar.high = Math.max(bar.high, quote.value)
    bar.close = quote.value
    bar.value = bar.close
  }

  #createChartBar(quote: Quote): ChartBar {
    return {
      open: quote.value,
      close: quote.value,
      time: quote.timestamp as Time,
      low: quote.value,
      high: quote.value,
      value: quote.value
    }
  }

  #smoothify(bars: ChartBar[]) {
    if (!bars.length) {
      return []
    }

    let i = bars.length - 1
    while (i !== 0) {
      bars[i - 1].close = bars[i].open
      bars[i - 1].value = bars[i - 1].close
      i--
    }
  }

  #merge(bars: ChartBar[]) {
    if (bars.length && this.#data.length) {
      while (bars[bars.length - 1].time === this.#data[0].time) {
        bars.pop()
      }

      this.#data[0].open = bars[bars.length - 1].close
    }

    this.#data = [...bars, ...this.#data]
  }
}

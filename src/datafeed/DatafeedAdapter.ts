import { CandleHttpService } from './CandleHttpService'
import { CandleStoreService } from './CandleStoreService'
import type {
  AssetSymbol,
  ChartBar,
  Datafeed,
  DatafeedCallbackFn,
  DatafeedDataCallbackFn,
  ResolutionId
} from '@chart/types'
import type { Bar, Quote } from '@datafeed/types'

export class DatafeedAdapter implements Datafeed {
  #ws: QuotesWwebsocketClient
  #assetSymbol: AssetSymbol
  #resolution: ResolutionId
  #quotesBuffer: Quote[] = []
  #earliestDate?: Date
  #subscriptionId?: number
  #loadingBars = false
  #inited: Promise<void>
  #callbacks: Map<string, DatafeedCallbackFn> = new Map()
  #dataCallbacks: Map<string, DatafeedDataCallbackFn> = new Map()
  #nextCallbackId = 0
  #candlesHttpService: CandleHttpService
  #candleStoreService: CandleStoreService

  constructor(
    assetSymbol: AssetSymbol,
    resolution: ResolutionId,
    timeZone: string,
    http: CandlesHttpClient,
    ws: QuotesWwebsocketClient
  ) {
    this.#resolution = resolution
    this.#assetSymbol = assetSymbol
    this.#ws = ws
    this.#candlesHttpService = new CandleHttpService(resolution, assetSymbol, http)
    this.#candleStoreService = new CandleStoreService(resolution, timeZone)
    this.#inited = this.#initSubscription()
  }

  getAssetSymbol() {
    return this.#assetSymbol
  }

  getResolutionId() {
    return this.#resolution
  }

  unsubscribe(id: string) {
    this.#callbacks.delete(id)
    this.#dataCallbacks.delete(id)
  }

  destroy() {
    if (this.#subscriptionId) {
      this.#ws.unsubscribeFromQuotes(this.#assetSymbol.id, this.#subscriptionId)
    }
  }

  async subscribeForData(callback: DatafeedDataCallbackFn) {
    await this.#inited
    this.#nextCallbackId++

    const id = this.#nextCallbackId.toString()
    this.#dataCallbacks.set(id, callback)
    callback(this.#candleStoreService.getData())
    return id
  }

  async subscribe(callback: DatafeedCallbackFn, prefix?: string): Promise<string> {
    await this.#inited
    ++this.#nextCallbackId

    const id = (prefix || '') + this.#nextCallbackId.toString()
    this.#callbacks.set(id, callback)
    callback({ type: 'set', data: this.#candleStoreService.getData() })
    return id
  }

  async #initSubscription(): Promise<void> {
    let firstQuoteReceived = false
    let dataLoaded = false

    const handleQuote = (quote: Quote, loaded: () => void) => {
      if (dataLoaded) {
        const data = this.#candleStoreService.updateWithQuote(quote)
        this.#fireCallbacks({ type: 'update', data })
      } else {
        this.#quotesBuffer.push(quote)
      }

      if (!firstQuoteReceived) {
        firstQuoteReceived = true
        this.#earliestDate = new Date(quote.timestamp * 1000)
        this.#loadBars().then(() => {
          this.#quotesBuffer.forEach((quote) => {
            this.#candleStoreService.updateWithQuote(quote)
          })
          dataLoaded = true
          loaded()
        })
      }
    }

    return new Promise<void>((resolve) => {
      this.#ws
        .subscribeToQuotes(this.#assetSymbol.id, (quote) => handleQuote(quote, resolve))
        .then((subid) => {
          this.#subscriptionId = subid
        })
    })
  }

  async loadHistory({ minCandles }: { minCandles: number }) {
    if (this.#loadingBars) {
      return
    }

    this.#loadingBars = true
    await this.#loadBars(minCandles)

    this.#fireCallbacks({ type: 'set', data: this.#candleStoreService.getData() })
    this.#loadingBars = false
  }

  getBars() {
    return this.#candleStoreService.getData()
  }

  #fireCallbacks(event: { type: 'set' | 'update'; data: ChartBar[] }) {
    this.#callbacks.forEach((cb) => cb(event))
    this.#dataCallbacks.forEach((cb) => cb(this.#candleStoreService.getData()))
  }

  async #loadBars(countBack: number = 300) {
    if (!this.#earliestDate) {
      throw 'Setup last date first'
    }

    const data = await this.#candlesHttpService.getCandles({ to: this.#earliestDate, count: countBack })
    this.#candleStoreService.addHistory(data)

    if (data.length) {
      this.#earliestDate = new Date(data[0].time)
    }
  }
}

export type CandlesHttpClient = {
  getBars(assetId: string, from: string, to: string, detalization: string): Promise<Bar[]>
}

export type QuotesWwebsocketClient = {
  subscribeToQuotes(assetId: string, callback: (quote: Quote) => void): Promise<number>
  unsubscribeFromQuotes(assetId: string, id: number): void
}

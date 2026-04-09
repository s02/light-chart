import { CandleHttpService } from './CandleHttpService'
import { CandleStoreService } from './CandleStoreService'
import type { HttpTransport, Quote, WsTransport } from './transport/types'
import type { AssetSymbol, ChartBar, Datafeed, DatafeedCallbackFn, ResolutionId } from '@chart/types'

export class DatafeedAdapter implements Datafeed {
  #ws: WsTransport
  #assetSymbol: AssetSymbol
  #resolution: ResolutionId
  #quotesBuffer: Quote[] = []
  #earliestDate?: Date
  #subscriptionId?: number
  #loadingBars = false
  #callbacks: Map<number, DatafeedCallbackFn> = new Map()
  #nextCallbackId = 0
  #candlesHttpService: CandleHttpService
  #candleStoreService: CandleStoreService

  constructor(assetSymbol: AssetSymbol, resolution: ResolutionId, http: HttpTransport, ws: WsTransport) {
    this.#resolution = resolution
    this.#assetSymbol = assetSymbol
    this.#ws = ws
    this.#candlesHttpService = new CandleHttpService(resolution, assetSymbol, http)
    this.#candleStoreService = new CandleStoreService(resolution)
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
      callback({ type: 'set', data: this.#candleStoreService.getData() })
      return id
    }

    let firstQuoteReceived = false
    let dataLoaded = false

    this.#subscriptionId = await this.#ws.subscribeToQuotes(this.#assetSymbol.id, async (quote) => {
      if (dataLoaded) {
        const data = this.#candleStoreService.updateWithQuote(quote)
        this.#fireCallbacks({ type: 'update', data })
      } else {
        this.#quotesBuffer.push(quote)
      }

      if (!firstQuoteReceived) {
        firstQuoteReceived = true
        this.#earliestDate = new Date(quote.timestamp * 1000)
        await this.#loadBars()

        this.#quotesBuffer.forEach((quote) => {
          this.#candleStoreService.updateWithQuote(quote)
        })
        dataLoaded = true
        this.#fireCallbacks({ type: 'set', data: this.#candleStoreService.getData() })
      }
    })

    return id
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

  #fireCallbacks(event: { type: 'set' | 'update'; data: ChartBar[] }) {
    this.#callbacks.forEach((cb) => cb(event))
  }

  getBars() {
    return this.#candleStoreService.getData()
  }

  async #loadBars(countBack: number = 300) {
    if (!this.#earliestDate) {
      throw 'Setup last date first'
    }

    const data = await this.#candlesHttpService.getCandles({ to: this.#earliestDate, count: countBack })
    this.#candleStoreService.addHistory(data)

    if (data.length) {
      this.#earliestDate = new Date(data[0].time * 1000)
    }
  }
}

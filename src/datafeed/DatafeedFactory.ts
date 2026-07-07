import { DatafeedAdapter } from '@datafeed/DatafeedAdapter'
import { HttpClient } from '@datafeed/HttpClient'
import { WebSocketClient } from '@datafeed/WebSocketClient'
import type { AssetSymbol, ResolutionId } from '@chart/types'

export class DatafeedFactory {
  #httpClient: HttpClient
  #wsClient: WebSocketClient

  constructor(apiHost: string, wsHost: string) {
    this.#httpClient = new HttpClient({ api: apiHost })
    this.#wsClient = new WebSocketClient(this.#httpClient, { host: wsHost })
  }

  create(assetSymbol: AssetSymbol, resolutionId: ResolutionId) {
    return new DatafeedAdapter(assetSymbol, resolutionId, this.#httpClient, this.#wsClient)
  }
}

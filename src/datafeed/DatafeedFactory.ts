import { DatafeedAdapter, type CandlesHttpClient, type QuotesWwebsocketClient } from '@datafeed/DatafeedAdapter'
import type { AssetSymbol, ResolutionId } from '@chart/types'

export class DatafeedFactory {
  #httpClient: CandlesHttpClient
  #wsClient: QuotesWwebsocketClient

  constructor(httpClient: CandlesHttpClient, ws: QuotesWwebsocketClient) {
    this.#httpClient = httpClient
    this.#wsClient = ws
  }

  create(assetSymbol: AssetSymbol, resolutionId: ResolutionId, timeZone: string) {
    return new DatafeedAdapter(assetSymbol, resolutionId, timeZone, this.#httpClient, this.#wsClient)
  }
}

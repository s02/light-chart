import { inject } from 'vue'
import { DatafeedAdapter } from './DatafeedAdapter'
import { HTTP_CLIENT_KEY } from './transport/HttpClient'
import { WS_CLIENT_KEY } from './transport/WebSocketClient'
import type { ResolutionId } from './lib/constants'
import type { AssetSymbol } from './lib/Chart'

export const useDatafeed = () => {
  const httpClient = inject(HTTP_CLIENT_KEY)
  const wsClient = inject(WS_CLIENT_KEY)

  if (!httpClient) {
    throw 'No http client provided'
  }

  if (!wsClient) {
    throw 'No ws client provided'
  }

  const create = (assetSymbol: AssetSymbol, resolutionId: ResolutionId) => {
    return new DatafeedAdapter(assetSymbol, resolutionId, httpClient, wsClient)
  }

  return {
    create
  }
}

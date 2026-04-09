import { DatafeedAdapter } from './DatafeedAdapter'
import { Http } from './transport/HttpClient'
import { Ws } from './transport/WebSocketClient'
import type { AssetSymbol, ResolutionId } from '@chart/types'

export const datafeedFactory = (assetSymbol: AssetSymbol, resolutionId: ResolutionId) =>
  new DatafeedAdapter(assetSymbol, resolutionId, Http.get(), Ws.get())

import type { Http } from '@app/transport/HttpClient'
import type { PROFITABILITY } from './constants'
import type { AssetSymbol, ChartExpiration } from '@chart/types'
import type { Ws } from '@app/transport/WebSocketClient'

export type ProfitabilityType = (typeof PROFITABILITY)[keyof typeof PROFITABILITY]

export type ChartUserState = {
  assetSymbol: AssetSymbol
  profitabilityType: ProfitabilityType
  expiration?: Expiration
}

export type AppExpiration = {
  expiration: Expiration
  chartExpiration: ChartExpiration
}

export type ChartState = Omit<ChartUserState, 'expiration'> & {
  expirations: Expiration[]
  currentExpiration?: AppExpiration
}

export type Asset = {
  id: string
  name: string
}

export type OptionKind = 'up' | 'down'

export type Option = {
  asset: Asset['id']
  id: number
  sum: number
  kind: OptionKind
  quoteOpen: number
  createdAt: string
  expirationDate: string
}

export type Bar = {
  time: string
  open: number
  high: number
  low: number
  close: number
}

export type Expiration = {
  type: number
  lock: string
  close: string
}

export type Quote = {
  value: number
  timestamp: number
}

export type HttpClient = ReturnType<typeof Http.get>
export type WsClient = ReturnType<typeof Ws.get>

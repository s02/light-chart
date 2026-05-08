import type { PROFITABILITY } from './constants'
import type { AssetSymbol, ChartExpiration } from '@chart/types'
import type { Expiration } from './transport/types'

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

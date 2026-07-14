import type { PROFITABILITY } from './constants'
import type { ChartExpiration } from '@chart/types'

export type ProfitabilityType = (typeof PROFITABILITY)[keyof typeof PROFITABILITY]

export type AppExpiration = {
  expiration: Expiration
  chartExpiration: ChartExpiration
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

export type Expiration = {
  type: number
  lock: string
  close: string
}

import type { Asset } from './types'

export const PROFITABILITY = {
  TURBO: 1,
  BINARY: 2
} as const

export const ASSETS: Asset[] = [
  {
    id: '34',
    name: 'ETHEREUM'
  },
  {
    id: '116',
    name: 'PMX'
  }
]

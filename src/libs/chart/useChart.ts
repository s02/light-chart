import type { AssetSymbol, ResolutionId, SeriesId } from '@engine/types'
import { reactive } from 'vue'

type ChartState = {
  assetSymbol: AssetSymbol
  resolutionId: ResolutionId
  seriesId: SeriesId
}

const initialState = {
  assetSymbol: {
    id: '1',
    name: 'EUR/USD'
  },
  resolutionId: '5S',
  seriesId: 'candlestick'
} as const

const state = reactive<ChartState>(initialState)

export const useChart = () => {
  return {
    state
  }
}

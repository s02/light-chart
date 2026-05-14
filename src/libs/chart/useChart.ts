import type { AssetSymbol, ResolutionId, SeriesId, IndicatorScript } from '@engine/types'
import { reactive } from 'vue'

type IndicatorSettings = {
  key: IndicatorScript
  id?: number
}

type EngineCallbacks = {
  addIndicator: (name: IndicatorScript) => Promise<number>
  removeIndicator: (id: number) => void
  //updateIndicator: (id: number, settings: unknown) => void
}

let engine: EngineCallbacks | null = null

type ChartState = {
  assetSymbol: AssetSymbol
  resolutionId: ResolutionId
  seriesId: SeriesId
  indicators: IndicatorSettings[]
}

const initialState = {
  assetSymbol: {
    id: '1',
    name: 'EUR/USD'
  },
  resolutionId: '5S',
  seriesId: 'candlestick',
  indicators: [] as IndicatorSettings[]
} as const

const state = reactive<ChartState>(initialState)

export const useChart = () => {
  const registerEngine = (callbacks: EngineCallbacks) => {
    engine = callbacks
  }

  const addIndicator = async (key: IndicatorScript) => {
    if (!engine) {
      throw `Engine should be registered.`
    }

    const id = await engine.addIndicator(key)

    state.indicators.push({
      key,
      id
    })
  }

  const removeIndicator = (id: number) => {
    if (!engine) {
      throw `Engine should be registered.`
    }

    engine.removeIndicator(id)
  }

  return {
    state,
    registerEngine,
    addIndicator,
    removeIndicator
  }
}

import type { DrawingName } from '@engine/drawings'
import type { AssetSymbol, ResolutionId, SeriesId, IndicatorScript } from '@engine/types'
import { reactive } from 'vue'

type IndicatorSettings = {
  key: IndicatorScript
  id?: number
}

type EngineCallbacks = {
  addIndicator: (name: IndicatorScript) => Promise<number>
  removeIndicator: (id: number) => void
  editIndicator: (id: number) => void
  startDrawing: (id: DrawingName) => Promise<number>
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
  function checkEngine(engine: EngineCallbacks | null): asserts engine {
    if (!engine) {
      throw `Engine should be registered.`
    }
  }

  const registerEngine = (callbacks: EngineCallbacks) => {
    engine = callbacks
  }

  const addIndicator = async (key: IndicatorScript) => {
    checkEngine(engine)

    const id = await engine.addIndicator(key)

    state.indicators.push({
      key,
      id
    })
  }

  const removeIndicator = (id: number) => {
    checkEngine(engine)
    engine.removeIndicator(id)
  }

  const editIndicator = (id: number) => {
    checkEngine(engine)
    engine.editIndicator(id)
  }

  const startDrawing = (id: DrawingName) => {
    checkEngine(engine)
    return engine.startDrawing(id)
  }

  return {
    state,
    registerEngine,
    addIndicator,
    removeIndicator,
    editIndicator,
    startDrawing
  }
}

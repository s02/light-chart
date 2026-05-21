import type { DrawingName } from '@engine/drawings'
import type { IndicatorName } from '@engine/indicators'
import type { StudyParams } from '@engine/schema'

type EngineCallbacks = {
  addIndicator: (key: IndicatorName) => Promise<number>
  removeIndicator: (id: number) => void
  editIndicator: (id: number) => void
  startDrawing: (name: DrawingName) => Promise<number> | undefined
  updateDrawing: (id: number, params: StudyParams) => void
  removeDrawing: (id: number) => void
}

function assertEngine(engine: EngineCallbacks | null): asserts engine {
  if (!engine) {
    throw `Engine should be registered.`
  }
}

let engine: EngineCallbacks | null = null

export const useEngine = () => {
  const registerEngine = (callbacks: EngineCallbacks) => {
    engine = callbacks
  }

  const addIndicator = async (key: IndicatorName) => {
    assertEngine(engine)
    engine.addIndicator(key)
  }

  const removeIndicator = (id: number) => {
    assertEngine(engine)
    engine.removeIndicator(id)
  }

  const editIndicator = (id: number) => {
    assertEngine(engine)
    engine.editIndicator(id)
  }

  const startDrawing = (name: DrawingName) => {
    assertEngine(engine)
    return engine.startDrawing(name)
  }

  const updateDrawing = (id: number, params: StudyParams) => {
    assertEngine(engine)
    engine.updateDrawing(id, params)
  }

  const removeDrawing = (id: number) => {
    assertEngine(engine)
    engine.removeDrawing(id)
  }

  return {
    registerEngine,
    addIndicator,
    removeIndicator,
    editIndicator,
    startDrawing,
    updateDrawing,
    removeDrawing
  }
}

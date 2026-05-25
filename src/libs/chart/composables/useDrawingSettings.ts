import { useEngine } from '@chart/composables/useEngine'
import type { DrawingSelectFn } from '@engine/drawings/types'
import type { StudyParams } from '@engine/schema'
import { computed, ref } from 'vue'

const selectedDrawingElement = ref<Parameters<DrawingSelectFn>[0] | null>(null)

export const useDrawingSettings = () => {
  const { updateDrawing, removeDrawing } = useEngine()

  const update = (params: StudyParams) => {
    if (!selectedDrawingElement.value) {
      throw new Error(`Drawing doesn't selected`)
    }

    updateDrawing(selectedDrawingElement.value.id, params)
    selectedDrawingElement.value.ds.params = params
  }

  const remove = () => {
    if (!selectedDrawingElement.value) {
      throw new Error(`Drawing doesn't selected`)
    }

    removeDrawing(selectedDrawingElement.value.id)
    selectedDrawingElement.value = null
  }

  return {
    drawingSchema: computed(() => {
      if (selectedDrawingElement.value) {
        return selectedDrawingElement.value.ds
      }

      return null
    }),
    remove,
    update,
    set: (res: Parameters<DrawingSelectFn>[0] | null) => {
      selectedDrawingElement.value = res
    }
  }
}

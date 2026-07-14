import type { Language } from '@chart/types'
import type { ResolutionId, SeriesId } from '@engine/types'
import { reactive } from 'vue'

type ChartState = {
  resolutionId: ResolutionId | null
  seriesId: SeriesId | null
  language: Language
}

const state = reactive<ChartState>({
  resolutionId: null,
  seriesId: null,
  language: 'en'
})

export const useChart = () => {
  return {
    state
  }
}

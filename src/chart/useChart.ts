import type { ResolutionId, SeriesId } from '@engine/types'
import { reactive } from 'vue'

type ChartState = {
  resolutionId: ResolutionId | null
  seriesId: SeriesId | null
}

const state = reactive<ChartState>({
  resolutionId: null,
  seriesId: null
})

export const useChart = () => {
  return {
    state
  }
}

import { useModal } from '@chart/composables/useModal'
import ModalIndicatorsList from '@chart/components/ModalIndicatorsList.vue'
import { useChart } from '@chart/useChart'
import type { IndicatorScript } from '@engine/types'

export const openScriptList = () => {}

export const useIndicators = () => {
  const { open } = useModal()
  const { addIndicator } = useChart()

  const openScriptList = () => {
    open<IndicatorScript | undefined>(ModalIndicatorsList).then((result) => {
      if (result) {
        addIndicator(result)
      }
    })
  }

  return {
    openScriptList
  }
}

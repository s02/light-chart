import { useModal } from '@chart/composables/useModal'
import ModalIndicatorsList from '@chart/components/ModalIndicatorsList.vue'
import type { IndicatorScript } from '@engine/types'
import { useEngine } from '@chart/composables/useEngine'

export const useIndicators = () => {
  const { open } = useModal()
  const { addIndicator } = useEngine()

  const openScriptList = () => {
    open<IndicatorScript | undefined>(ModalIndicatorsList).then((result) => {
      if (result) {
        addIndicator(result.indicator.ikey)
      }
    })
  }

  return {
    openScriptList
  }
}

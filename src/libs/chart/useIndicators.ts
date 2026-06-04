import { useModal } from '@chart/composables/useModal'
import ModalIndicatorsList from '@chart/components/ModalIndicatorsList.vue'
import type { IndicatorScript } from '@engine/types'
import { useEngineApi } from '@chart/composables/useEngine'

export const useIndicators = () => {
  const { open } = useModal()
  const { addIndicator } = useEngineApi()

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

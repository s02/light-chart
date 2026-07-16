import { ref } from 'vue'

const current = ref<string | undefined>()

export const useHints = () => {
  const show = (text: string) => {
    current.value = text
  }

  const hide = () => {
    current.value = undefined
  }

  return {
    show,
    hide,
    current
  }
}

import { inject, provide, ref } from 'vue'
import type { ComponentPublicInstance, InjectionKey, ShallowRef } from 'vue'

type BtnEl = HTMLElement | ComponentPublicInstance

type Params = {
  btn: ShallowRef<BtnEl | null>
  isOpened: ReturnType<typeof ref<boolean>>
  close: () => void
  open: () => void
}

export type ChartMenuKey = InjectionKey<Params>
export const provideChartMenu = (key: string, el: ShallowRef<BtnEl | null>) => {
  const isOpened = ref(false)
  const injectionKey = Symbol(key) as ChartMenuKey

  const close = () => {
    isOpened.value = false
  }

  const open = () => {
    isOpened.value = true
  }

  provide(injectionKey, { btn: el, isOpened, close, open })

  return { close, open, key: injectionKey }
}

export const injectChartMenu = (key: ChartMenuKey) => {
  const methods = inject(key)

  if (!methods) {
    throw 'No Params Provided for Chart Menu'
  }

  return methods
}

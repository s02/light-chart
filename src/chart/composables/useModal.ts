import { inject, provide, shallowRef, type Component, type InjectionKey, type ShallowRef } from 'vue'

type ComponentProps = Record<string, unknown>

type ModalOptions = {
  props: ComponentProps
}

type ModalState = {
  component: Component
  result: {
    resolve: (value: unknown) => void
  }
  props?: ComponentProps
}

type ModalStore = {
  queue: ModalState[]
  current: ShallowRef<ModalState | null>
}

const ModalStoreKey: InjectionKey<ModalStore> = Symbol('modal-store')

const createModalStore = (): ModalStore => ({
  queue: [],
  current: shallowRef(null)
})

const createModalApi = (store: ModalStore) => {
  const next = () => {
    if (!store.current.value) {
      store.current.value = store.queue.shift() ?? null
    }
  }

  const close = () => {
    store.current.value = null
    next()
  }

  const open = <T extends undefined extends T ? unknown : never>(component: Component, options?: ModalOptions) => {
    return new Promise<T>((resolve) => {
      store.queue.push({
        component,
        props: options?.props,
        result: {
          resolve: resolve as (value: unknown) => void
        }
      })
      next()
    })
  }

  return {
    open,
    close
  }
}

const useModalStore = (): ModalStore => {
  const store = inject(ModalStoreKey, null)
  if (!store) {
    throw new Error('useModal/useModalState must be used within a TerminalChart instance')
  }
  return store
}

export const provideModal = () => {
  const store = createModalStore()
  provide(ModalStoreKey, store)
  return createModalApi(store)
}

export const useModal = () => createModalApi(useModalStore())

export const useModalState = () => {
  const { current } = useModalStore()
  return { current }
}

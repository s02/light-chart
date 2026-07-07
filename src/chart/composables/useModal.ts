import { shallowRef, type Component } from 'vue'

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

const queue: ModalState[] = []
const current = shallowRef<ModalState | null>(null)

export const useModalState = () => {
  return {
    current
  }
}

export const useModal = () => {
  const next = () => {
    if (!current.value) {
      current.value = queue.shift() ?? null
    }
  }

  const close = () => {
    current.value = null
    next()
  }

  const open = <T extends undefined extends T ? unknown : never>(component: Component, options?: ModalOptions) => {
    return new Promise<T>((resolve) => {
      queue.push({
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

import { autoUpdate, size, useFloating, type Placement } from '@floating-ui/vue'
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import { computed, ref } from 'vue'

export type FloatingOptions = {
  placement?: Placement
  onClose?: () => void
}

export const useFloatingDropdown = (options: FloatingOptions) => {
  const isOpened = ref(false)
  const triggerRef = ref<HTMLElement | null>(null)
  const targetRef = ref<HTMLElement | null>(null)

  const open = () => {
    isOpened.value = true
  }

  const close = () => {
    isOpened.value = false
    if (options.onClose) {
      options.onClose()
    }
  }

  const toggle = () => {
    isOpened.value = !isOpened.value
  }

  onClickOutside(targetRef, close, { ignore: [triggerRef] })

  onKeyStroke('Escape', () => isOpened.value && close())

  const { floatingStyles, placement } = useFloating(triggerRef, targetRef, {
    placement: options.placement ?? 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [
      size({
        apply({ availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.max(0, availableHeight)}px`
          })
        }
      })
    ],
    strategy: 'fixed'
  })

  const triggerProps = computed(() => ({
    'aria-haspopup': 'menu',
    'aria-expanded': isOpened.value,
    onClick: toggle
  }))

  return {
    isOpened,
    open,
    close,
    toggle,
    triggerRef,
    triggerProps,
    targetRef,
    floatingStyles,
    placement
  }
}

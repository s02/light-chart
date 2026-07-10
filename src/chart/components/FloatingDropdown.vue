<script setup lang="ts">
import { useEngineApi } from '@chart/composables/useEngine'
import { autoUpdate, size, useFloating, type Placement } from '@floating-ui/vue'
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import { computed, ref, type ComponentPublicInstance } from 'vue'

type FloatingOptions = {
  placement?: Placement
}

const props = defineProps<FloatingOptions>()
const isOpened = defineModel<boolean>('open', { default: false })

const triggerRef = ref<HTMLElement | null>(null)
const targetRef = ref<HTMLElement | null>(null)

const { rootEl } = useEngineApi()

const setTriggerRef = (el: Element | ComponentPublicInstance | null): void => {
  triggerRef.value = (el as HTMLElement) ?? null
}

const { floatingStyles, placement } = useFloating(triggerRef, targetRef, {
  placement: props.placement ?? 'bottom-start',
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

const toggle = () => {
  isOpened.value = !isOpened.value
}

const close = () => {
  isOpened.value = false
}

onClickOutside(targetRef, close, { ignore: [triggerRef] })

onKeyStroke('Escape', () => {
  if (isOpened.value) {
    close()
  }
})
</script>

<template>
  <slot name="trigger" :trigger-ref="setTriggerRef" :trigger-props="triggerProps" :is-open="isOpened" />

  <Teleport v-if="rootEl" :to="rootEl">
    <div
      v-if="isOpened"
      ref="targetRef"
      class="mwc-floating-dropdown"
      :style="floatingStyles"
      :data-placement="placement">
      <slot :close="close" :placement="placement" />
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.mwc-floating-dropdown {
  background-color: #001020;
  border-radius: 6px;
  box-shadow: 0 2px 4px #0006;
  z-index: 10;
  overflow: auto;
}
</style>

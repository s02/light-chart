<script setup lang="ts">
import { injectChartMenu, type ChartMenuKey } from '@chart/useChartMenu'
import { useFloating, type Placement } from '@floating-ui/vue'
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import { useTemplateRef } from 'vue'

const props = withDefaults(
  defineProps<{
    menuKey: ChartMenuKey
    closeable?: boolean
    placement?: Placement
  }>(),
  { closeable: true, placement: undefined }
)

const target = useTemplateRef('target')
const { isOpened, close, btn } = injectChartMenu(props.menuKey)

const { floatingStyles: menuResStyles } = useFloating(btn, target, {
  placement: props.placement || 'bottom-start',
  middleware: [],
  strategy: 'fixed'
})

onClickOutside(target, close)
onKeyStroke('Escape', close)
</script>

<template>
  <Teleport to="#app">
    <div ref="target" class="chart-menu" :style="menuResStyles">
      <div v-if="isOpened" class="chart-menu-body">
        <slot></slot>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
@use 'ChartMenu.scss';
</style>

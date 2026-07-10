<script lang="ts" setup>
import ChartMenuItem from '@chart/components/ChartMenuItem.vue'
import CToggleButton from '@chart/components/Controls/CToggleButton.vue'
import FloatingDropdown from '@chart/components/FloatingDropdown.vue'
import type { StudyParamValue } from '@engine/schema'

const currentValue = defineModel<StudyParamValue>('current')
const isOpened = defineModel<boolean>('isOpened', { default: false })

defineProps<{ values: readonly string[] }>()

const setValue = (val: StudyParamValue) => {
  currentValue.value = val
  isOpened.value = false
}
</script>

<template>
  <FloatingDropdown :open="isOpened" @update:open="isOpened = false">
    <template #trigger="{ triggerRef }">
      <div :ref="triggerRef" class="mwc-select" @click="isOpened = true">
        {{ currentValue }}
        <CToggleButton :is-opened="isOpened" />
      </div>
    </template>
    <div class="mwc-dropdown">
      <ChartMenuItem v-for="val of values" :key="val" @click="setValue(val)">
        {{ val }}
      </ChartMenuItem>
    </div>
  </FloatingDropdown>
</template>

<style lang="scss" scoped>
@use 'CSelect.scss';
</style>

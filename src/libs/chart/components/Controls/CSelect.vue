<script lang="ts" setup>
import ChartMenuItem from '@chart/components/ChartMenuItem.vue'
import FloatingDropdown from '@chart/components/FloatingDropdown.vue'
import type { StudyParamValue } from '@engine/schema'

const currentValue = defineModel<StudyParamValue>('current')
const isOpened = defineModel<boolean>('isOpened')

defineProps<{ values: readonly string[] }>()

const setValue = (val: StudyParamValue) => {
  currentValue.value = val
  isOpened.value = false
}
</script>

<template>
  <FloatingDropdown :open="isOpened" @update:open="isOpened = false">
    <template #trigger="{ triggerRef }">
      <div :ref="triggerRef" class="c-select" @click="isOpened = true">
        {{ currentValue }}
        <div class="c-select-btn" :class="{ isOpened }">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18">
            <path fill="currentColor" d="M3.92 7.83 9 12.29l5.08-4.46-1-1.13L9 10.29l-4.09-3.6-.99 1.14Z"></path>
          </svg>
        </div>
      </div>
    </template>
    <div class="c-dropdown">
      <ChartMenuItem v-for="val of values" :key="val" @click="setValue(val)">
        {{ val }}
      </ChartMenuItem>
    </div>
  </FloatingDropdown>
</template>

<style lang="scss" scoped>
@use 'CSelect.scss';
</style>

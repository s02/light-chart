<script lang="ts" setup>
import FloatingDropdown from '@chart/components/Dropdown/FloatingDropdown.vue'
import ColorPicker from '@chart/components/ColorPicker.vue'

defineProps<{ color: string }>()

const isOpened = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  (e: 'update', color: string): void
}>()
</script>

<template>
  <FloatingDropdown :open="isOpened" @update:open="isOpened = false">
    <template #trigger="{ triggerRef }">
      <div :ref="triggerRef" class="drw-btn drw-btn-c" @click="isOpened = true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 15" width="13" height="15" fill="none">
          <path
            stroke="currentColor"
            d="M4 14.5h2.5m2.5 0H6.5m0 0V.5m0 0h-5a1 1 0 0 0-1 1V4m6-3.5h5a1 1 0 0 1 1 1V4"></path>
        </svg>
        <div class="drw-btn-c-line" :style="{ backgroundColor: `${color}` }"></div>
      </div>
    </template>
    <ColorPicker :color="color" @select="emit('update', $event)" @close="isOpened = false" />
  </FloatingDropdown>
</template>

<style lang="scss" scoped>
@use 'btn.scss';
@use 'DrawingPropLineColor.scss';
</style>

<script setup lang="ts">
import FloatingDropdown from '@chart/components/Dropdown/FloatingDropdown.vue'
import LineWidthPicker from '@chart/components/LineWidthPicker.vue'

defineProps<{ width: number }>()

const isOpened = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  (e: 'update', width: number): void
}>()

const update = (width: number) => {
  emit('update', width)
  isOpened.value = false
}
</script>

<template>
  <FloatingDropdown :open="isOpened" @update:open="isOpened = false">
    <template #trigger="{ triggerRef }">
      <div :ref="triggerRef" class="drw-btn drw-btn-w" @click="isOpened = true">
        <div class="drw-btn-w-line" :style="{ height: `${width}px` }"></div>
        <div class="drw-btn-w-label">{{ width }}px</div>
      </div>
    </template>
    <LineWidthPicker :values="[1, 2, 3, 4, 5, 6]" :width="width" @select="update" />
  </FloatingDropdown>
</template>

<style lang="scss" scoped>
@use 'btn.scss';
@use 'PropLineWidth.scss';
</style>

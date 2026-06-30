<script lang="ts" setup>
import FloatingDropdown from '@chart/components/Dropdown/FloatingDropdown.vue'
import LineWidthPicker from '@chart/components/LineWidthPicker.vue'

defineProps<{ width: number }>()

const isOpened = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  (e: 'update', width: number): void
}>()
</script>

<template>
  <FloatingDropdown :open="isOpened" @update:open="isOpened = false">
    <template #trigger="{ triggerRef }">
      <button :ref="triggerRef" class="study-line-btn" @click="isOpened = true">
        <span class="study-line-w" :style="{ height: `${width}px` }"></span>
      </button>
    </template>
    <LineWidthPicker
      :values="[1, 2, 3, 4, 5, 6]"
      :width="width"
      @select="emit('update', $event)"
      @close="isOpened = false" />
  </FloatingDropdown>
</template>

<style lang="scss" scoped>
@use 'StudyLineWidth.scss';
</style>

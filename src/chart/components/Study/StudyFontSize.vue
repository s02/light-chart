<script lang="ts" setup>
import FloatingDropdown from '@chart/components/FloatingDropdown.vue'
import FontSizePicker from '@chart/components/Pickers/FontSizePicker.vue'

defineProps<{ size: number }>()

const isOpened = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  (e: 'update', size: number): void
}>()
</script>

<template>
  <FloatingDropdown :open="isOpened" @update:open="isOpened = false">
    <template #trigger="{ triggerRef }">
      <button :ref="triggerRef" class="mwc-study-fs-btn" @click="isOpened = true">
        {{ size }}
      </button>
    </template>
    <FontSizePicker
      :values="[8, 10, 11, 12, 14, 16, 18, 20, 22, 28, 32, 40]"
      :size="size"
      @select="emit('update', $event)"
      @close="isOpened = false" />
  </FloatingDropdown>
</template>

<style lang="scss" scoped>
@use 'StudyFontSize.scss';
</style>

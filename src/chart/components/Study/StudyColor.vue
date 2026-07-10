<script lang="ts" setup>
import FloatingDropdown from '@chart/components/FloatingDropdown.vue'
import ColorPicker from '@chart/components/Pickers/ColorPicker.vue'

defineProps<{ color: string }>()

const isOpened = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  (e: 'update', color: string): void
}>()
</script>

<template>
  <FloatingDropdown :open="isOpened" @update:open="isOpened = false">
    <template #trigger="{ triggerRef }">
      <button :ref="triggerRef" class="mwc-study-color-btn" @click="isOpened = true">
        <span class="mwc-study-color-bg" :style="{ backgroundColor: color }"></span>
      </button>
    </template>
    <ColorPicker :color="color" @select="emit('update', $event)" @close="isOpened = false" />
  </FloatingDropdown>
</template>

<style lang="scss" scoped>
@use 'StudyColor.scss';
</style>

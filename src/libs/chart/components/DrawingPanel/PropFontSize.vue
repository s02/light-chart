<script setup lang="ts">
import FloatingDropdown from '@chart/components/Dropdown/FloatingDropdown.vue'
import FontSizePicker from '@chart/components/FontSizePicker.vue'

defineProps<{ size: number }>()

const isOpened = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  (e: 'update', size: number): void
}>()

const update = (size: number) => {
  emit('update', size)
  isOpened.value = false
}
</script>

<template>
  <FloatingDropdown :open="isOpened" @update:open="isOpened = false">
    <template #trigger="{ triggerRef }">
      <div :ref="triggerRef" class="drw-btn drw-btn-w" @click="isOpened = true">
        <div class="drw-btn-w-label">{{ size }}px</div>
      </div>
    </template>

    <FontSizePicker :values="[8, 10, 11, 12, 14, 16, 18, 20, 22, 28, 32, 40]" :size="size" @select="update" />
  </FloatingDropdown>
</template>

<style lang="scss" scoped>
@use 'btn.scss';
@use 'PropLineWidth.scss';
</style>

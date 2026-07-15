<script setup lang="ts">
import FloatingDropdown from '@chart/components/FloatingDropdown.vue'
import LineStylePicker from '@chart/components/Pickers/LineStylePicker.vue'

defineProps<{ lineStyle: string }>()

const isOpened = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  (e: 'update', lineStyle: string): void
}>()

const update = (lineStyle: string) => {
  emit('update', lineStyle)
  isOpened.value = false
}
</script>

<template>
  <FloatingDropdown :open="isOpened" @update:open="isOpened = false">
    <template #trigger="{ triggerRef }">
      <div :ref="triggerRef" class="mwc-drw-btn" @click="isOpened = true">
        <div class="mwc-drw-btn-s-line" :class="`mwc-drw-btn-s-line-${lineStyle}`"></div>
      </div>
    </template>
    <LineStylePicker :values="['solid', 'dashed', 'dotted']" :line-style="lineStyle" @select="update" />
  </FloatingDropdown>
</template>

<style lang="scss" scoped>
@use 'btn.scss';
@use 'PropLineStyle.scss';
</style>

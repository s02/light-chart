<script lang="ts" setup>
import FloatingDropdown from '@chart/components/FloatingDropdown.vue'
import LineStylePicker from '@chart/components/Pickers/LineStylePicker.vue'

defineProps<{ lineStyle: string }>()

const isOpened = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  (e: 'update', lineStyle: string): void
}>()
</script>

<template>
  <FloatingDropdown :open="isOpened" @update:open="isOpened = false">
    <template #trigger="{ triggerRef }">
      <button :ref="triggerRef" class="mwc-study-line-btn" @click="isOpened = true">
        <span class="study-line-s" :class="`study-line-s-${lineStyle}`"></span>
      </button>
    </template>
    <LineStylePicker
      :values="['solid', 'dashed', 'dotted']"
      :line-style="lineStyle"
      @select="emit('update', $event)"
      @close="isOpened = false" />
  </FloatingDropdown>
</template>

<style lang="scss" scoped>
@use 'StudyLineStyle.scss';
</style>

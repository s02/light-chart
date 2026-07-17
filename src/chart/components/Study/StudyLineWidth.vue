<script lang="ts" setup>
import FloatingDropdown from '@chart/components/FloatingDropdown.vue'
import LineWidthPicker from '@chart/components/Pickers/LineWidthPicker.vue'
import { ref } from 'vue'

withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false })

const isOpened = ref(false)
const width = defineModel<number>({ default: 1 })
</script>

<template>
  <FloatingDropdown :open="isOpened" @update:open="isOpened = false">
    <template #trigger="{ triggerRef }">
      <button :ref="triggerRef" class="mwc-study-line-btn" @click="isOpened = true">
        <span class="study-line-w" :style="{ height: `${width}px` }"></span>
      </button>
    </template>
    <LineWidthPicker :values="[1, 2, 3, 4, 5, 6]" :width="width" @select="width = $event" @close="isOpened = false" />
  </FloatingDropdown>
</template>

<style lang="scss" scoped>
@use 'StudyLineWidth.scss';
</style>

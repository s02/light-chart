<script lang="ts" setup>
import FloatingDropdown from '@chart/components/FloatingDropdown.vue'
import FontSizePicker from '@chart/components/Pickers/FontSizePicker.vue'
import { ref } from 'vue'

withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false })

const isOpened = ref(false)
const size = defineModel<number>({ default: 16 })
</script>

<template>
  <FloatingDropdown :open="isOpened" @update:open="isOpened = false">
    <template #trigger="{ triggerRef }">
      <button :ref="triggerRef" :disabled="disabled" class="mwc-study-fs-btn" @click="isOpened = true">
        {{ size }}px
      </button>
    </template>
    <FontSizePicker
      :values="[8, 10, 11, 12, 14, 16, 18, 20, 22, 28, 32, 40]"
      :size="size"
      @select="size = $event"
      @close="isOpened = false" />
  </FloatingDropdown>
</template>

<style lang="scss" scoped>
@use 'StudyFontSize.scss';
</style>

<script lang="ts" setup>
import FloatingDropdown from '@chart/components/FloatingDropdown.vue'
import ColorPicker from '@chart/components/Pickers/ColorPicker.vue'
import { ref } from 'vue'

withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false })

const isOpened = ref(false)
const color = defineModel<string>({ default: 'rgb(255 255 255)' })
</script>

<template>
  <FloatingDropdown :open="isOpened" @update:open="isOpened = false">
    <template #trigger="{ triggerRef }">
      <button :ref="triggerRef" :disabled="disabled" class="mwc-study-color-btn" @click="isOpened = true">
        <span class="mwc-study-color-bg" :style="{ backgroundColor: color }"></span>
      </button>
    </template>
    <ColorPicker :color="color" @select="color = $event" @close="isOpened = false" />
  </FloatingDropdown>
</template>

<style lang="scss" scoped>
@use 'StudyColor.scss';
</style>

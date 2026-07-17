<script lang="ts" setup>
import FloatingDropdown from '@chart/components/FloatingDropdown.vue'
import LineStylePicker from '@chart/components/Pickers/LineStylePicker.vue'
import { ref } from 'vue'

withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false })

const isOpened = ref(false)
const style = defineModel<string>({ default: 'solid' })
</script>

<template>
  <FloatingDropdown :open="isOpened" @update:open="isOpened = false">
    <template #trigger="{ triggerRef }">
      <button :ref="triggerRef" class="mwc-study-line-btn" @click="isOpened = true">
        <span class="study-line-s" :class="`study-line-s-${style}`"></span>
      </button>
    </template>
    <LineStylePicker
      :values="['solid', 'dashed', 'dotted']"
      :line-style="style"
      @select="style = $event"
      @close="isOpened = false" />
  </FloatingDropdown>
</template>

<style lang="scss" scoped>
@use 'StudyLineStyle.scss';
</style>

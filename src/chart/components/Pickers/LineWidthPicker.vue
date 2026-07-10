<script setup lang="ts">
defineProps<{ width: number; values: number[] }>()

const emit = defineEmits<{
  (e: 'select', width: number): void
  (e: 'close'): void
}>()

const select = (v: number) => {
  emit('select', v)
  emit('close')
}
</script>

<template>
  <div class="mwc-line-width-picker">
    <button
      v-for="w of values"
      :key="w"
      class="mwc-line-width-picker-button"
      :active="w === width"
      :class="{ active: w === width }"
      @click="select(w)">
      <span class="mwc-line-width-picker-line" :style="{ height: `${w}px` }"></span>
      {{ w }}px
    </button>
  </div>
</template>

<style lang="scss" scoped>
@use 'LineWidthPicker.scss';
</style>

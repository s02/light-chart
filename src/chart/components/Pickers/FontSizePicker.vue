<script setup lang="ts">
defineProps<{ size: number; values: number[] }>()

const emit = defineEmits<{
  (e: 'select', size: number): void
  (e: 'close'): void
}>()

const select = (v: number) => {
  emit('select', v)
  emit('close')
}
</script>

<template>
  <div class="mwc-font-size-picker">
    <button v-for="s of values" :key="s" :active="s === size" class="mwc-font-size-picker-btn" @click="select(s)">
      {{ s }}px
    </button>
  </div>
</template>

<style lang="scss" scoped>
@use 'FontSizePicker.scss';
</style>

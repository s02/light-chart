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
  <div class="fs">
    <button v-for="s of values" :key="s" :active="s === size" class="fs-btn" @click="select(s)">{{ s }}px</button>
  </div>
</template>

<style lang="scss" scoped>
@use 'FontSizePicker.scss';
</style>

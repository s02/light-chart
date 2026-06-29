<script setup lang="ts">
defineProps<{ size: number }>()

const emit = defineEmits<{
  (e: 'select', size: number): void
  (e: 'close'): void
}>()

const sizes = [8, 10, 11, 12, 14, 16, 18, 20, 22, 28, 32, 40]

const select = (v: number) => {
  emit('select', v)
  emit('close')
}
</script>

<template>
  <div class="fs">
    <button v-for="s of sizes" :key="s" :active="s === size" class="fs-btn" @click="select(s)">{{ s }}px</button>
  </div>
</template>

<style lang="scss" scoped>
@use 'FontSizePicker.scss';
</style>

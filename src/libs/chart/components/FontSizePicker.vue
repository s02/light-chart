<script setup lang="ts">
import ChartMenuItem from '@chart/components/ChartMenuItem.vue'

defineProps<{ size: number }>()

const emit = defineEmits<{
  (e: 'select', size: number): void
  (e: 'close'): void
}>()

const sizes = [8, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 40]

const select = (v: number) => {
  emit('select', v)
  emit('close')
}
</script>

<template>
  <div class="line-picker">
    <ChartMenuItem v-for="s of sizes" :key="s" :active="s === size" @click="select(s)"> {{ s }}px</ChartMenuItem>
  </div>
</template>

<style lang="scss" scoped>
@use 'LineWidthPicker.scss';
</style>

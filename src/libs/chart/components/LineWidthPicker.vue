<script setup lang="ts">
import ChartMenuItem from '@chart/components/ChartMenuItem.vue'

const emit = defineEmits<{
  (e: 'select', width: number): void
}>()

const WIDTHS = [1, 2, 3, 4]
</script>

<template>
  <div class="line-picker">
    <ChartMenuItem v-for="width of WIDTHS" :key="width" @click="emit('select', width)">
      <div class="line-picker-w" :style="{ height: `${width}px` }"></div>
      {{ width }}px</ChartMenuItem
    >
  </div>
</template>

<style lang="scss" scoped>
@use 'LineWidthPicker.scss';
</style>

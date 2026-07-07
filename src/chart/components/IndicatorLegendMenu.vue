<script setup lang="ts">
import ChartMenuItem from '@chart/components/ChartMenuItem.vue'

const emit = defineEmits<{
  (e: 'action', name: 'remove' | 'edit'): void
}>()
</script>

<template>
  <div class="indicators-legend-menu">
    <ChartMenuItem class="indicators-legend-menu-item" @click="emit('action', 'remove')">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
        <path
          fill="currentColor"
          d="M18 7h5v1h-2.01l-1.33 14.64a1.5 1.5 0 0 1-1.5 1.36H9.84a1.5 1.5 0 0 1-1.49-1.36L7.01 8H5V7h5V6c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v1Zm-6-2a1 1 0 0 0-1 1v1h6V6a1 1 0 0 0-1-1h-4ZM8.02 8l1.32 14.54a.5.5 0 0 0 .5.46h8.33a.5.5 0 0 0 .5-.46L19.99 8H8.02Z"></path>
      </svg>
      Remove</ChartMenuItem
    >
    <ChartMenuItem class="indicators-legend-menu-item" @click="emit('action', 'edit')">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28" fill="currentColor">
        <path fill-rule="evenodd" d="M18 14a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-1 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path>
        <path
          fill-rule="evenodd"
          d="M8.5 5h11l5 9-5 9h-11l-5-9 5-9Zm-3.86 9L9.1 6h9.82l4.45 8-4.45 8H9.1l-4.45-8Z"></path>
      </svg>
      Settings</ChartMenuItem
    >
  </div>
</template>

<style lang="scss" scoped>
@use 'IndicatorLegendMenu.scss';
</style>

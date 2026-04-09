<script setup lang="ts">
defineProps<{ active?: boolean }>()
</script>

<template>
  <div class="chart-menu-item" :class="{ active }">
    <div class="chart-menu-item-body"><slot></slot></div>
  </div>
</template>

<style lang="scss" scoped>
@use 'ChartMenuItem.scss';
</style>

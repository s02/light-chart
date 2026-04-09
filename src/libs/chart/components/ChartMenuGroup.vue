<script setup lang="ts">
defineProps<{ name?: string }>()
</script>

<template>
  <div class="chart-group">
    <div v-if="name" class="chart-group-name">{{ name }}</div>
    <div class="chart-group-body">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'ChartMenuGroup.scss';
</style>

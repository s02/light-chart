<script setup lang="ts">
defineProps<{ name?: string }>()
</script>

<template>
  <div class="mwc-chart-group">
    <div v-if="name" class="mwc-chart-group-name">{{ name }}</div>
    <div class="mwc-chart-group-body">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'ChartMenuGroup.scss';
</style>

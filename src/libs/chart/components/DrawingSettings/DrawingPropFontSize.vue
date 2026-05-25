<script setup lang="ts">
defineProps<{ width: number }>()
</script>

<template>
  <div class="drw-btn drw-btn-w">
    <div class="drw-btn-w-label">{{ width }}px</div>
  </div>
</template>

<style lang="scss" scoped>
@use 'btn.scss';
@use 'DrawingPropLineWidth.scss';
</style>

<script setup lang="ts">
defineProps<{ lineStyle: number; lineWidth: number }>()
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
    <line
      x1="2"
      y1="14"
      x2="26"
      y2="14"
      stroke="currentColor"
      :stroke-width="lineWidth"
      :stroke-linecap="lineStyle === 1 || lineStyle === 4 ? 'round' : 'butt'"
      :stroke-dasharray="
        lineStyle === 1
          ? '0.1 4'
          : lineStyle === 2
            ? '4 3'
            : lineStyle === 3
              ? '8 4'
              : lineStyle === 4
                ? '0.1 7'
                : undefined
      "></line>
  </svg>
</template>

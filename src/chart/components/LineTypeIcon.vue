<script setup lang="ts">
defineProps<{ lineType: number }>()
</script>

<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none">
    <path
      v-if="lineType === 0"
      stroke="currentColor"
      d="M5.5 17C8.5 17 8.5 9 11.5 9C14.5 9 14.5 17 17.5 17C20.5 17 20.5 9 23.5 9"></path>

    <path v-else-if="lineType === 1" stroke="currentColor" d="M5.5 17v5.5h4v-18h4v12h4v-9h4V21"></path>
    <path
      v-else-if="lineType === 2"
      stroke="currentColor"
      d="M5.5 16.5l4.586-4.586a2 2 0 0 1 2.828 0l3.172 3.172a2 2 0 0 0 2.828 0L23.5 10.5"></path>
  </svg>
</template>

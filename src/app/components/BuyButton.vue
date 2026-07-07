<script setup lang="ts">
defineProps<{
  direction: 'up' | 'down'
}>()
</script>

<template>
  <button :class="direction">
    <svg data-v-d5af5260="" xmlns="http://www.w3.org/2000/svg" width="31" height="20" viewBox="0 0 31 20">
      <path fill="none" fill-rule="evenodd" stroke="currentColor" stroke-width="6" d="M3 17L15.5 5 28 17"></path>
    </svg>
  </button>
</template>

<style lang="scss" scoped>
@use 'BuyButton.scss';
</style>

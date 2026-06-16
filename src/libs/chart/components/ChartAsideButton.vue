<script setup lang="ts">
const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'click'): void
}>()

defineProps<{ icon: string; initialized: boolean; opened: boolean }>()
</script>

<template>
  <div class="ca-btn">
    <div class="ca-btn-icon" :class="{ initialized }" @click="emit('click')" v-html="icon"></div>
    <div class="ca-btn-collapse" :class="{ opened }" @click="emit('toggle')">
      <svg class="ca-btn-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 16" width="4" height="7">
        <path d="M.6 1.4l1.4-1.4 8 8-8 8-1.4-1.4 6.389-6.532-6.389-6.668z" stroke="currentColor"></path>
      </svg>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'ChartAsideButton.scss';
</style>

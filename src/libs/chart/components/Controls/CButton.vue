<script setup lang="ts">
withDefaults(defineProps<{ type?: 'primary' | 'secondary' | 'transparent'; disabled?: boolean }>(), {
  type: 'primary',
  disabled: false
})
</script>

<template>
  <button :class="type" :disabled="disabled"><slot></slot></button>
</template>

<style lang="scss" scoped>
@use 'CButton.scss';
</style>

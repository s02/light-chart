<script setup lang="ts">
defineProps<{ text: string }>()
const emit = defineEmits<{
  (e: 'select', text: string): void
}>()

const change = (val: string) => {
  emit('select', val)
}
</script>

<template>
  <input type="text" :value="text" @input="change(($event.target as HTMLInputElement).value)" />
</template>

<style lang="scss" scoped>
@use 'DrawingPropText.scss';
</style>

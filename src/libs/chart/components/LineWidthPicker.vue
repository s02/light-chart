<script setup lang="ts">
import ChartMenuItem from '@chart/components/ChartMenuItem.vue'

const props = defineProps<{ width: number; options?: number[] }>()

const emit = defineEmits<{
  (e: 'select', width: number): void
  (e: 'close'): void
}>()

const WIDTHS = [1, 2, 3, 4, 5]

const select = (v: number) => {
  emit('select', v)
  emit('close')
}
console.log(props.options)
</script>

<template>
  <div class="line-picker">
    <ChartMenuItem v-for="w of options ?? WIDTHS" :key="w" :active="w === width" @click="select(w)">
      <div v-if="!options" class="line-picker-w" :style="{ height: `${w}px` }"></div>
      {{ w }}px</ChartMenuItem
    >
  </div>
</template>

<style lang="scss" scoped>
@use 'LineWidthPicker.scss';
</style>

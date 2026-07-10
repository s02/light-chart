<script setup lang="ts">
import { helpers } from '@chart/helpers'
import { DRAWING_COLORS } from '@engine/drawings'
import { computed, ref } from 'vue'

const props = defineProps<{ color: string }>()

const emit = defineEmits<{
  (e: 'select', color: string): void
  (e: 'close'): void
}>()

const mergedColor = computed(() => {
  const { baseColor, opacity } = colorValue.value
  return baseColor.replace(')', ` / ${opacity}%)`)
})

const colorValue = ref<{ baseColor: string; opacity: number }>(helpers.parseColor(props.color))

const selectBaseColor = (color: string) => {
  colorValue.value = {
    baseColor: color,
    opacity: colorValue.value.opacity
  }

  emit('select', mergedColor.value)
  emit('close')
}

const changeOpacity = (value: string) => {
  colorValue.value = {
    baseColor: colorValue.value.baseColor,
    opacity: Number(value)
  }

  emit('select', mergedColor.value)
}
</script>

<template>
  <div class="mwc-color-picker">
    <div class="mwc-color-picker-colors">
      <button
        v-for="c of DRAWING_COLORS"
        :key="c"
        class="mwc-color"
        :style="{ backgroundColor: c }"
        @click="selectBaseColor(c)"></button>
    </div>
    <div class="mwc-color-picker-opacity">
      <label>Opacity {{ colorValue.opacity }}%</label>
      <input
        :value="colorValue.opacity"
        type="range"
        min="0"
        max="100"
        @change="changeOpacity(($event.target as HTMLInputElement).value)" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'ColorPicker.scss';
</style>

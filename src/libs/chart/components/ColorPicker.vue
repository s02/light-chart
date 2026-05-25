<script setup lang="ts">
import { computed, ref } from 'vue'

const COLORS = [
  'rgb(255 255 255)',
  'rgb(219 219 219)',
  'rgb(184 184 184)',
  'rgb(156 156 156)',
  'rgb(128 128 128)',
  'rgb(99 99 99)',
  'rgb(74 74 74)',
  'rgb(48 48 48)',
  'rgb(26 26 26)',
  'rgb(0 0 0)',
  'rgb(242 54 69)',
  'rgb(255 152 0)',
  'rgb(76 175 80)',
  'rgb(8 153 129)',
  'rgb(0 188 212)',
  'rgb(41 98 255)',
  'rgb(103 58 183)',
  'rgb(156 39 176)',
  'rgb(233 30 99)'
] as const

const props = defineProps<{ color: string }>()

const emit = defineEmits<{
  (e: 'select', color: string): void
  (e: 'close'): void
}>()

const parseColor = (color: string) => {
  const inner = color.slice(4, -1)
  const slashIdx = inner.indexOf('/')
  if (slashIdx === -1) {
    return { baseColor: color, opacity: 100 }
  }

  const base = inner.slice(0, slashIdx).trim()
  const alphaStr = inner.slice(slashIdx + 1).trim()
  const isPercent = alphaStr.endsWith('%')
  const value = parseFloat(alphaStr)

  return {
    baseColor: `rgb(${base})`,
    opacity: Math.round(isPercent ? value : value * 100)
  }
}

const mergedColor = computed(() => {
  const { baseColor, opacity } = colorValue.value
  return baseColor.replace(')', ` / ${opacity}%)`)
})

const colorValue = ref<{ baseColor: string; opacity: number }>(parseColor(props.color))

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
  <div class="color-picker">
    <div class="color-picker-colors">
      <button
        v-for="c of COLORS"
        :key="c"
        class="color"
        :style="{ backgroundColor: c }"
        @click="selectBaseColor(c)"></button>
    </div>
    <div class="color-picker-opacity">
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

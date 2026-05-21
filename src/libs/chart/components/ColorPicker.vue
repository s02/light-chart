<script setup lang="ts">
import { ref } from 'vue'

const COLORS = [
  'rgb(255, 255, 255)',
  'rgb(219,219,219)',
  'rgb(184,184,184)',
  'rgb(156,156,156)',
  'rgb(128,128,128)',
  'rgb(99,99,99)',
  'rgb(74,74,74)',
  'rgb(48,48,48)',
  'rgb(26,26,26)',
  'rgb(0,0,0)',
  'rgb(242, 54, 69)',
  'rgb(255, 152, 0)',
  'rgb(76, 175, 80)',
  'rgb(8, 153, 129)',
  'rgb(0, 188, 212)',
  'rgb(41, 98, 255)',
  'rgb(103, 58, 183)',
  'rgb(156, 39, 176)',
  'rgb(233, 30, 99)'
] as const

const emit = defineEmits<{
  (e: 'select', color: string): void
}>()

const opacity = ref<number>(100)

const select = (color: string) => {
  emit('select', color.replace(')', `,${opacity.value / 100})`))
}
</script>

<template>
  <div class="color-picker">
    <div class="color-picker-colors">
      <button
        v-for="color of COLORS"
        :key="color"
        class="color"
        :style="{ backgroundColor: color }"
        @click="select(color)"></button>
    </div>
    <div class="color-picker-opacity">
      <label>Opacity {{ opacity }}%</label>
      <input v-model="opacity" type="range" min="0" max="100" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'ColorPicker.scss';
</style>

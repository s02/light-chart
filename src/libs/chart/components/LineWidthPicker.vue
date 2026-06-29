<script setup lang="ts">
defineProps<{ width: number }>()

const emit = defineEmits<{
  (e: 'select', width: number): void
  (e: 'close'): void
}>()

const WIDTHS = [1, 2, 3, 4, 5, 6]

const select = (v: number) => {
  emit('select', v)
  emit('close')
}
</script>

<template>
  <div class="lp">
    <button
      v-for="w of WIDTHS"
      :key="w"
      class="lp-button"
      :active="w === width"
      :class="{ active: w === width }"
      @click="select(w)">
      <span class="lp-line" :style="{ height: `${w}px` }"></span>
      {{ w }}px
    </button>
  </div>
</template>

<style lang="scss" scoped>
@use 'LineWidthPicker.scss';
</style>

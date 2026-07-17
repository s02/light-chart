<script setup lang="ts">
defineProps<{ lineStyle: string; values: string[] }>()

const emit = defineEmits<{
  (e: 'select', lineStyle: string): void
  (e: 'close'): void
}>()

const select = (v: string) => {
  emit('select', v)
  emit('close')
}
</script>

<template>
  <div class="mwc-line-style-picker">
    <button
      v-for="s of values"
      :key="s"
      class="mwc-line-style-picker-button"
      :class="{ active: s === lineStyle }"
      @click="select(s)">
      <span class="mwc-line-style-picker-line" :class="`mwc-line-style-picker-line-${s}`"></span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
@use 'LineStylePicker.scss';
</style>

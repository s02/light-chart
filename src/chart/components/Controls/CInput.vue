<script setup lang="ts">
import { computed } from 'vue'

const model = defineModel<number | string | boolean>({ required: true })

const props = withDefaults(
  defineProps<{
    type?: 'number' | 'text'
    min?: number
    max?: number
    step?: number
    disabled?: boolean
  }>(),
  { type: 'text', min: undefined, max: undefined, step: undefined }
)

const inputValue = computed({
  get: () => model.value,
  set: (val) => {
    if (props.type === 'number' && typeof val === 'number') {
      if (props.min !== undefined && val < props.min) val = props.min
      if (props.max !== undefined && val > props.max) val = props.max
    }
    model.value = val
  }
})
</script>

<template>
  <input
    v-model="inputValue"
    :disabled="disabled"
    :type="props.type"
    :min="props.min"
    :max="props.max"
    :step="props.step ?? 1" />
</template>

<style lang="scss" scoped>
@use 'CInput.scss';
</style>

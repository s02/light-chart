<script setup lang="ts">
const model = defineModel<number | string | boolean>({ required: true })
</script>

<template>
  <label>
    <input v-model="model" type="checkbox" />
    <span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 9" width="11" height="9" fill="none">
        <path stroke="currentColor" stroke-width="2" d="M0.999878 4L3.99988 7L9.99988 1"></path>
      </svg>
    </span>
  </label>
</template>

<style lang="scss" scoped>
@use 'CCheckbox.scss';
</style>

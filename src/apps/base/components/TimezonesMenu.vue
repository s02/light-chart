<script setup lang="ts">
import { TIMEZONES } from '@app/constants'

const model = defineModel<string>()
</script>

<template>
  <select v-model="model" required>
    <option v-for="tz in TIMEZONES" :key="tz" :value="tz">{{ tz }}</option>
  </select>
</template>

<style lang="scss" scoped>
@use 'TimezonesMenu.scss';
</style>

<script setup lang="ts">
import { i18n } from '@chart/i18n'

type Tab = string

defineProps<{ tabs: { key: Tab }[]; active: Tab }>()
const emit = defineEmits<(e: 'selected', key: Tab) => void>()
</script>

<template>
  <div class="tabs">
    <div class="tabs-items">
      <div
        v-for="el in tabs"
        :key="el.key"
        :class="{ active: active === el.key }"
        class="tabs-item"
        @click="emit('selected', el.key)">
        {{ i18n.translate(el.key) }}
      </div>
    </div>
    <div class="tabs-border"></div>
  </div>
</template>

<style lang="scss" scoped>
@use 'ChartTabs.scss';
</style>

<script setup lang="ts">
import ChartMenuItem from '@chart/components/ChartMenuItem.vue'
import SeriesIcon from '@chart/components/SeriesIcon.vue'
import { i18n } from '@chart/i18n'
import type { SeriesId } from '@engine/types'

const emit = defineEmits<{
  (e: 'selected', seriesId: SeriesId): void
}>()

defineProps<{ active: SeriesId }>()

const values: SeriesId[] = ['bar', 'candlestick', 'line', 'area', 'heikin', 'hollow']
</script>
<template>
  <div class="mwc-series-menu">
    <ChartMenuItem
      v-for="series in values"
      :key="series"
      :active="active === series"
      class="mwc-series-menu-item"
      @click="emit('selected', series)">
      <SeriesIcon :series-id="series" />
      {{ i18n.translate(`series-${series}`) }}</ChartMenuItem
    >
  </div>
</template>
<style lang="scss" scoped>
@use 'SeriesMenu.scss';
</style>

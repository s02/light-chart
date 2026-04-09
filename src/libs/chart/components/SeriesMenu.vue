<script setup lang="ts">
import ChartMenuItem from '@chart/components/ChartMenuItem.vue'
import SeriesIcon from '@chart/components/SeriesIcon.vue'
import { i18n } from '@chart/i18n'
import { useChart } from '@chart/useChart'
import type { SeriesId } from '@engine/types'

const emit = defineEmits<{
  (e: 'selected'): void
}>()

const { state } = useChart()

const setSeries = (seriesId: SeriesId) => {
  state.seriesId = seriesId
  emit('selected')
}

const values = ['bar', 'candlestick', 'line', 'area'] as const
</script>
<template>
  <div class="series-menu">
    <ChartMenuItem
      v-for="series in values"
      :key="series"
      :active="state.seriesId === series"
      class="series-menu-item"
      @click="setSeries(series)"
    >
      <SeriesIcon :series-id="series" />
      {{ i18n.translate(`series-${series}`) }}</ChartMenuItem
    >
  </div>
</template>
<style lang="scss" scoped>
@use 'SeriesMenu.scss';
</style>

<script setup lang="ts">
import type { ChartSeriesLegend } from '@engine/types'

defineProps<{ legends: ChartSeriesLegend[] }>()
</script>

<template>
  <div class="chart-legends">
    <div v-for="legend in legends" :key="legend.id" class="chart-legend" :class="legend.category">
      <div v-if="legend.category !== 'main'" class="chart-legend-name">{{ legend.key }}</div>
      <div v-for="(d, i) in legend.data" :key="i">
        <span v-if="d.label">{{ d.label }}</span> <span :style="{ color: d.color }">{{ d.value }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'ChartLegend.scss';
</style>

<script setup lang="ts">
import ChartLegend from '@chart/components/ChartLegend.vue'
import type { PlotEngine } from '@engine/PlotEngine'
import type { ChartSeriesLegend } from '@engine/types'
import { onUnmounted, ref } from 'vue'

const props = defineProps<{ paneIndex: number; subscribeToLegends: PlotEngine['subscribeToLegends'] }>()

const paneLegends = ref<ChartSeriesLegend[]>([])
const unsub = props.subscribeToLegends((legends) => {
  paneLegends.value = legends.filter((legend) => legend.paneIndex === props.paneIndex)
})

onUnmounted(() => {
  unsub()
})
</script>

<template>
  <div class="pane-legend">
    <ChartLegend :legends="paneLegends" />
  </div>
</template>

<style lang="scss" scoped>
@use 'PaneLegend.scss';
</style>

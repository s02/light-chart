<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { PlotEngine } from '@engine/PlotEngine'
import ChartHeader from '@chart/components/ChartHeader.vue'
import { useChart } from '@chart/useChart'
import type { DatafeedFactory, TerminalChartConfig } from '@chart/types'
import type { AssetSymbol, ChartExpiration, ChartOption } from '@engine/types'

const props = defineProps<{
  assetSymbol: AssetSymbol
  datafeedFactory: DatafeedFactory
  defaultConfig: TerminalChartConfig
  options?: ChartOption[]
  expiration?: ChartExpiration
}>()

const { state } = useChart()
state.assetSymbol = props.assetSymbol
state.resolutionId = props.defaultConfig.resolutionId
state.seriesId = props.defaultConfig.seriesId

let pe: PlotEngine | null = null
const chartRef = ref<HTMLElement | null>(null)

onMounted(() => {
  pe = new PlotEngine(chartRef.value!, {
    datafeed: props.datafeedFactory(props.assetSymbol, state.resolutionId)
  })

  if (props.expiration) {
    pe.setExpiration(props.expiration)
  }

  if (props.options) {
    pe.setOptions(props.options)
  }
})

onUnmounted(() => {
  pe?.destroy()
  pe = null
})

watch(
  () => ({
    assetSymbol: props.assetSymbol,
    resolutionId: state.resolutionId,
    seriesId: state.seriesId,
    expiration: props.expiration
  }),
  (next, prev) => {
    if (next.assetSymbol.id !== prev.assetSymbol.id || next.resolutionId !== prev.resolutionId) {
      state.assetSymbol = props.assetSymbol
      pe?.setDatafeed(props.datafeedFactory(state.assetSymbol, state.resolutionId))
    }

    if (next.seriesId !== prev.seriesId) {
      pe?.setSeriesId(state.seriesId)
    }

    if (next.expiration && next.expiration.close !== prev.expiration?.close) {
      pe?.setExpiration(next.expiration)
    }
  }
)

watch(
  () => props.options,
  () => {
    if (props.options) {
      pe?.setOptions(props.options)
    }
  }
)
</script>

<template>
  <div class="chart">
    <div class="chart-header">
      <ChartHeader />
    </div>
    <div class="chart-aside"></div>
    <div ref="chartRef" class="chart-plot"></div>
  </div>
</template>

<style lang="scss" scoped>
@use 'TerminalChart.scss';
</style>

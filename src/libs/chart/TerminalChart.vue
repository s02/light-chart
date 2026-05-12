<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { PlotEngine } from '@engine/PlotEngine'
import ChartHeader from '@chart/components/ChartHeader.vue'
import ChartAside from '@chart/components/ChartAside.vue'
import { useChart } from '@chart/useChart'
import type { DatafeedFactory, TerminalChartConfig } from '@chart/types'
import type { AssetSymbol, ChartExpiration, ChartOption } from '@engine/types'
import ModalContainer from '@chart/ModalContainer.vue'
import type { IndicatorScript } from '@engine/indicators/types'

const props = defineProps<{
  assetSymbol: AssetSymbol
  datafeedFactory: DatafeedFactory
  defaultConfig: TerminalChartConfig
  options?: ChartOption[]
  expiration?: ChartExpiration
}>()

const { state, registerEngine } = useChart()
state.assetSymbol = props.assetSymbol
state.resolutionId = props.defaultConfig.resolutionId
state.seriesId = props.defaultConfig.seriesId

let pe: PlotEngine | null = null
const chartRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!chartRef.value) {
    throw 'Terminal Chart: no ref provided'
  }

  pe = new PlotEngine(chartRef.value, {
    datafeed: props.datafeedFactory(props.assetSymbol, state.resolutionId),
    seriesId: state.seriesId
  })

  if (props.expiration) {
    pe.setExpiration(props.expiration)
  }

  if (props.options) {
    pe.setOptions(props.options)
  }

  registerEngine({
    addIndicator: (key: IndicatorScript) => {
      if (!pe) {
        throw `engine isn't defined`
      }

      return pe.addIndicator(key)
    }
  })
})

onUnmounted(() => {
  if (!pe) {
    throw 'Terminal Chart: already destroyed'
  }

  pe.destroy()
  pe = null
})

watch(
  () => ({
    assetSymbol: props.assetSymbol,
    resolutionId: state.resolutionId,
    seriesId: state.seriesId,
    expiration: props.expiration,
    indicators: state.indicators
  }),
  (next, prev) => {
    if (!pe) {
      throw `Engine isn't ready`
    }

    if (next.assetSymbol.id !== prev.assetSymbol.id || next.resolutionId !== prev.resolutionId) {
      state.assetSymbol = props.assetSymbol
      pe.setDatafeed(props.datafeedFactory(state.assetSymbol, state.resolutionId))
    }

    if (next.seriesId !== prev.seriesId) {
      pe.setSeriesId(state.seriesId)
    }

    if (next.expiration && next.expiration.close !== prev.expiration?.close) {
      pe.setExpiration(next.expiration)
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
  <div class="t-chart">
    <div class="t-chart-header">
      <ChartHeader />
    </div>
    <div class="t-chart-aside">
      <ChartAside />
    </div>
    <div ref="chartRef" class="t-chart-plot"></div>
    <ModalContainer />
  </div>
</template>

<style lang="scss" scoped>
@use 'TerminalChart.scss';
</style>

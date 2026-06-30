<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, toRef } from 'vue'
import ChartHeader from '@chart/components/ChartHeader.vue'
import ChartAside from '@chart/components/ChartAside.vue'
import ModalContainer from '@chart/ModalContainer.vue'
import ChartLegend from '@chart/components/ChartLegend.vue'
import DrawingPanel from '@chart/components/DrawingPanel/DrawingPanel.vue'
import { useChart } from '@chart/useChart'
import { useEngineApi } from '@chart/composables/useEngine'
import type { AssetSymbol, ChartExpiration, ChartOption } from '@engine/types'
import type { DatafeedFactory, TerminalChartConfig } from '@chart/types'

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

const chartRef = ref<HTMLElement | null>(null)
const mainPaneLegends = computed(() => legends.value.filter((legend) => legend.paneIndex === 0))
const { register, unregister, legends } = useEngineApi()

onMounted(() => {
  if (!chartRef.value) {
    throw 'Terminal Chart: no ref provided'
  }

  register(chartRef.value, {
    seriesId: toRef(state, 'seriesId'),
    options: toRef(props, 'options'),
    expiration: toRef(props, 'expiration'),
    assetSymbol: toRef(props, 'assetSymbol'),
    resolutionId: toRef(state, 'resolutionId'),
    datafeedFactory: props.datafeedFactory
  })
})

onUnmounted(() => {
  unregister()
})
</script>

<template>
  <div class="t-chart">
    <div class="t-chart-header">
      <ChartHeader />
    </div>
    <div class="t-chart-aside">
      <ChartAside />
    </div>
    <div class="t-chart-wrapper">
      <div class="t-chart-legends">
        <ChartLegend :legends="mainPaneLegends" />
      </div>
      <DrawingPanel class="t-chart-drawings" />
      <div ref="chartRef" class="t-chart-plot"></div>
    </div>
    <ModalContainer />
  </div>
</template>

<style lang="scss" scoped>
@use 'TerminalChart.scss';
</style>

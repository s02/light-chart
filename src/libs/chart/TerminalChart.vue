<script setup lang="ts">
import { computed, h, onMounted, onUnmounted, ref, render, watch } from 'vue'
import { PlotEngine } from '@engine/PlotEngine'
import ChartHeader from '@chart/components/ChartHeader.vue'
import ChartAside from '@chart/components/ChartAside.vue'
import { useChart } from '@chart/useChart'
import ModalContainer from '@chart/ModalContainer.vue'
import ChartLegend from '@chart/components/ChartLegend.vue'
import PaneLegend from '@chart/components/PaneLegend.vue'
import type { DatafeedFactory, TerminalChartConfig } from '@chart/types'
import type { ChartSeriesLegend, AssetSymbol, ChartExpiration, ChartOption } from '@engine/types'
import type { IndicatorScript } from '@engine/types'

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
let unsub: () => void
const chartRef = ref<HTMLElement | null>(null)
const legends = ref<ChartSeriesLegend[]>([])
const mainPaneLegends = computed(() => legends.value.filter((legend) => legend.paneIndex === 0))

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
    addIndicator: async (key: IndicatorScript) => {
      if (!pe) {
        throw `Engine isn't defined`
      }

      const t = await pe.addIndicator(key)

      if (t.paneIndex > 0 && t.el) {
        render(h(PaneLegend, { paneIndex: t.paneIndex, subscribeToLegends: pe.subscribeToLegends.bind(pe) }), t.el)
      }

      return t.id
    },
    removeIndicator: (id: number) => {
      if (!pe) {
        throw `Engine isn't defined`
      }

      pe.removeIndicator(id)
    }
  })

  unsub = pe.subscribeToLegends((l) => {
    legends.value = l
  })
})

onUnmounted(() => {
  if (!pe) {
    throw 'Terminal Chart: already destroyed'
  }

  pe.destroy()
  pe = null

  if (unsub) {
    unsub()
  }
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
    <div class="t-chart-wrapper">
      <div class="t-chart-legends">
        <ChartLegend :legends="mainPaneLegends" />
      </div>
      <div ref="chartRef" class="t-chart-plot"></div>
    </div>

    <ModalContainer />
  </div>
</template>

<style lang="scss" scoped>
@use 'TerminalChart.scss';
</style>

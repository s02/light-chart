<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, toRef } from 'vue'
import ChartHeader from '@chart/components/ChartHeader.vue'
import ChartAside from '@chart/components/ChartAside.vue'
import ModalContainer from '@chart/ModalContainer.vue'
import ChartLegend from '@chart/components/ChartLegend.vue'
import StudyPanel from '@chart/components/StudyPanel/StudyPanel.vue'
import { useChart } from '@chart/useChart'
import { useEngineApi } from '@chart/composables/useEngine'
import type { AssetSymbol, ChartExpiration, ChartOption, ResolutionId, SeriesId } from '@engine/types'
import type { DatafeedFactory, TerminalChartConfig } from '@chart/types'

const props = defineProps<{
  assetSymbol: AssetSymbol
  timeZone: string
  datafeedFactory: DatafeedFactory
  defaultConfig: TerminalChartConfig
  options?: ChartOption[]
  expiration?: ChartExpiration
  rootEl: string
}>()

const emit = defineEmits<{
  (e: 'resolutionChanged', resolution: ResolutionId): void
  (e: 'seriesChanged', seriesId: SeriesId): void
}>()

const { state } = useChart()
const isReady = ref(false)

state.resolutionId = props.defaultConfig.resolutionId
state.seriesId = props.defaultConfig.seriesId

const chartRef = ref<HTMLElement | null>(null)
const mainPaneLegends = computed(() => legends.value.filter((legend) => legend.paneIndex === 0))
const { register, unregister, legends } = useEngineApi()

onMounted(async () => {
  if (!chartRef.value) {
    throw 'Terminal Chart: no ref provided'
  }

  await register(chartRef.value, {
    seriesId: toRef(state, 'seriesId'),
    resolutionId: toRef(state, 'resolutionId'),
    timeZone: toRef(props, 'timeZone'),
    options: toRef(props, 'options'),
    expiration: toRef(props, 'expiration'),
    assetSymbol: toRef(props, 'assetSymbol'),
    datafeedFactory: props.datafeedFactory,
    rootEl: props.rootEl,
    onResolutionChanged: (resolution: ResolutionId) => {
      emit('resolutionChanged', resolution)
    },
    onSeriesChanged: (seriesId: SeriesId) => {
      emit('seriesChanged', seriesId)
    }
  })

  isReady.value = true
})

onUnmounted(() => {
  unregister()
})
</script>

<template>
  <div class="mwc-chart">
    <div v-if="!isReady" class="mwc-chart-loader"></div>
    <div class="mwc-chart-header">
      <ChartHeader />
    </div>
    <div class="mwc-chart-aside">
      <ChartAside />
    </div>
    <div class="mwc-chart-wrapper">
      <div class="mwc-chart-legends">
        <ChartLegend :legends="mainPaneLegends" />
      </div>
      <StudyPanel class="mwc-chart-drawings" />
      <div ref="chartRef" class="mwc-chart-plot"></div>
    </div>

    <ModalContainer />
  </div>
</template>

<style lang="scss" scoped>
@use 'TerminalChart.scss';
</style>

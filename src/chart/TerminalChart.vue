<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, toRef, watch } from 'vue'
import ChartHeader from '@chart/components/ChartHeader.vue'
import ChartAside from '@chart/components/ChartAside.vue'
import ModalContainer from '@chart/ModalContainer.vue'
import ChartLegend from '@chart/components/ChartLegend.vue'
import StudyPanel from '@chart/components/StudyPanel/StudyPanel.vue'
import { provideEngineApi } from '@chart/composables/useEngine'
import type { AssetSymbol, ChartExpiration, ChartOption, ResolutionId, SeriesId } from '@engine/types'
import type { DatafeedFactory, Language } from '@chart/types'
import HintsContainer from '@chart/HintsContainer.vue'
import { i18n } from '@chart/i18n'

const props = defineProps<{
  assetSymbol: AssetSymbol
  timeZone: string
  datafeedFactory: DatafeedFactory
  seriesId: SeriesId
  resolutionId: ResolutionId
  options?: ChartOption[]
  expiration?: ChartExpiration
  expirationOffset?: number
  language: Language
  rootEl: string
}>()

const emit = defineEmits<{
  (e: 'resolutionChanged', resolution: ResolutionId): void
  (e: 'seriesChanged', seriesId: SeriesId): void
}>()

const isReady = ref(false)

watch(
  () => props.language,
  (language) => i18n.setLanguage(language),
  { immediate: true }
)

const chartRef = ref<HTMLElement | null>(null)
const mainPaneLegends = computed(() => legends.value.filter((legend) => legend.paneIndex === 0))
const { register, unregister, legends } = provideEngineApi()

onMounted(async () => {
  if (!chartRef.value) {
    throw 'Terminal Chart: no ref provided'
  }

  await register(chartRef.value, {
    seriesId: toRef(props, 'seriesId'),
    resolutionId: toRef(props, 'resolutionId'),
    timeZone: toRef(props, 'timeZone'),
    options: toRef(props, 'options'),
    expiration: toRef(props, 'expiration'),
    expirationOffset: toRef(props, 'expirationOffset'),
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
      <ChartHeader
        :resolution-id="resolutionId"
        :series-id="seriesId"
        @resolution-changed="emit('resolutionChanged', $event)"
        @series-changed="emit('seriesChanged', $event)" />
    </div>
    <div class="mwc-chart-aside">
      <ChartAside />
    </div>
    <div class="mwc-chart-wrapper">
      <div class="mwc-chart-legends">
        <ChartLegend :legends="mainPaneLegends" :prefix="assetSymbol.name" />
      </div>
      <StudyPanel class="mwc-chart-drawings" />
      <div ref="chartRef" class="mwc-chart-plot"></div>
    </div>

    <ModalContainer />
    <HintsContainer />
  </div>
</template>

<style lang="scss" scoped>
@use 'TerminalChart.scss';
</style>

<script setup lang="ts">
import { computed, h, onMounted, onUnmounted, ref, render, watch } from 'vue'
import { PlotEngine } from '@engine/PlotEngine'
import ChartHeader from '@chart/components/ChartHeader.vue'
import ChartAside from '@chart/components/ChartAside.vue'
import { useChart } from '@chart/useChart'
import ModalContainer from '@chart/ModalContainer.vue'
import ChartLegend from '@chart/components/ChartLegend.vue'
import PaneLegend from '@chart/components/PaneLegend.vue'
import { useModal } from '@chart/composables/useModal'
import ModalIndicatorSettings from '@chart/components/ModalIndicatorSettings.vue'
import DrawingSettings from '@chart/components/DrawingSettings.vue'
import type {
  ChartSeriesLegend,
  DrawingName,
  AssetSymbol,
  ChartExpiration,
  ChartOption,
  IndicatorName
} from '@engine/types'
import type { DatafeedFactory, TerminalChartConfig } from '@chart/types'
import type { StudyParams } from '@engine/schema'
import { useEngine } from '@chart/composables/useEngine'
import { useDrawingSettings } from '@chart/composables/useDrawingSettings'
import type { DrawingSelectFn } from '@engine/drawings/types'

const props = defineProps<{
  assetSymbol: AssetSymbol
  datafeedFactory: DatafeedFactory
  defaultConfig: TerminalChartConfig
  options?: ChartOption[]
  expiration?: ChartExpiration
}>()

const { state } = useChart()
const { registerEngine } = useEngine()
const { open: openModal } = useModal()
const { set: setSelectedDrawing } = useDrawingSettings()

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

  function checkEngine(engine: PlotEngine | null): asserts engine {
    if (!engine) {
      throw `Engine isn't defined.`
    }
  }

  registerEngine({
    addIndicator: async (key: IndicatorName) => {
      checkEngine(pe)
      const t = await pe.addIndicator(key)

      if (t.paneIndex && t.paneIndex > 0 && t.el) {
        render(h(PaneLegend, { paneIndex: t.paneIndex, subscribeToLegends: pe.subscribeToLegends.bind(pe) }), t.el)
      }

      return t.id
    },
    removeIndicator: (id: number) => {
      checkEngine(pe)
      pe.removeIndicator(id)
    },
    editIndicator: async (id: number) => {
      checkEngine(pe)

      const schema = pe.getIndicatorSchema(id)
      const params = await openModal<StudyParams | undefined>(ModalIndicatorSettings, { props: schema })
      if (params) {
        pe.updateIndicator(id, params)
      }
    },
    startDrawing: async (id: DrawingName) => {
      checkEngine(pe)
      return pe.addDrawing(id)
    },
    updateDrawing: (id: number, params: StudyParams) => {
      checkEngine(pe)
      pe.updateDrawing(id, params)
    },
    removeDrawing: (id: number) => {
      checkEngine(pe)
      pe.removeDrawing(id)
    }
  })

  unsub = pe.subscribeToLegends((l) => {
    legends.value = l
  })

  pe.subscribeToSelectDrawing((res: Parameters<DrawingSelectFn>[0]) => {
    setSelectedDrawing(res)
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
    expiration: props.expiration
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

      <DrawingSettings class="t-chart-drawings" />

      <div ref="chartRef" class="t-chart-plot"></div>
    </div>

    <ModalContainer />
  </div>
</template>

<style lang="scss" scoped>
@use 'TerminalChart.scss';
</style>

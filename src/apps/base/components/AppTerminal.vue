<script setup lang="ts">
import { computed, createApp, h, onMounted, onUnmounted, ref, toRef } from 'vue'
import TerminalChart from '@chart/TerminalChart.vue'
import { useQuoteHandler, useTrading } from '@app/composables/useTrading'
import { helpers } from '@chart/helpers'
import BuyButton from '@app/components/BuyButton.vue'
import ExpirationMenu from '@app/components/ExpirationMenu.vue'
import { DatafeedFactory } from '@datafeed/DatafeedFactory'
import { Transport } from '@app/transport'
import TimezonesMenu from '@app/components/TimezonesMenu.vue'
import type { Language } from '@chart/types'
import { useChart, type ChartState } from '@app/composables/useChartState'

const props = defineProps<{ chartId: ChartState['id'] }>()

const { chart, setResolution, setSeries, setLanguage, setTimeZone } = useChart(toRef(props, 'chartId'))

const assetSymbolId = computed(() => chart.value.assetSymbol.id)

const { buyOption } = useTrading(toRef(props, 'chartId'), assetSymbolId)

const datafeedFactory = new DatafeedFactory(Transport.get().http, Transport.get().ws)

useQuoteHandler(assetSymbolId)

const chartOptions = computed(() => {
  const options = chart.value.options[assetSymbolId.value] || []

  return options.map((option) => ({
    ...option,
    createdAt: helpers.toZonedDate(option.createdAt, chart.value.timeZone),
    expirationDate: helpers.toZonedDate(option.expirationDate, chart.value.timeZone),
    getSum() {
      return this.sum + '$'
    }
  }))
})

const buy = (direction: 'up' | 'down') => {
  const currentExp = chart.value.currentExpiration

  if (!currentExp) {
    throw `Expiration is required when buying`
  }

  buyOption(direction, currentExp)
}

const chartRoot = ref<HTMLElement | null>(null)

const chartApp = createApp(() =>
  h(TerminalChart, {
    rootEl: '#teleport',
    language: chart.value.language,
    options: chartOptions.value,
    expiration: chart.value.zonedCurrentExpiration,
    assetSymbol: chart.value.assetSymbol,
    resolutionId: chart.value.resolutionId,
    seriesId: chart.value.seriesId,
    timeZone: chart.value.timeZone,
    datafeedFactory,
    onSeriesChanged: setSeries,
    onResolutionChanged: setResolution
  })
)

onMounted(() => {
  chartApp.mount(chartRoot.value!)
})

onUnmounted(() => {
  chartApp.unmount()
})
</script>

<template>
  <div class="terminal">
    <div ref="chartRoot" class="terminal-chart"></div>
    <div class="terminal-aside">
      <div class="terminal-menus">
        <ExpirationMenu :chart-id="chartId" />
        <TimezonesMenu :model-value="chart.timeZone" @update:model-value="setTimeZone($event!)" />
        <select :value="chart.language" @change="setLanguage(($event.target as HTMLSelectElement).value as Language)">
          <option value="ru">Русский</option>
          <option value="en">English</option>
        </select>
      </div>

      <div class="buy-buttons">
        <BuyButton direction="up" @click="buy('up')" />
        <BuyButton direction="down" @click="buy('down')" />
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@use 'AppTerminal.scss';
</style>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import TerminalChart from '@chart/TerminalChart.vue'
import { useChart } from './useChart'
import { useExpirations } from './useExpirations'
import { useTrading } from './useTrading'
import { datafeedFactory } from './datafeedFactory'
import { dateToEpoch } from '@chart/helpers'
import type { TerminalChartConfig } from '@chart/types'

const { data: expirations, format: formatExp } = useExpirations()
const { chartState, setExpiration } = useChart()
const { buyOption, options } = useTrading(toRef(() => chartState.value.assetSymbol.id))

const chartOptions = computed(() =>
  options.value.map((option) => ({
    ...option,
    createdAt: dateToEpoch(option.createdAt),
    expirationDate: dateToEpoch(option.expirationDate)
  }))
)

const defaultConfig: TerminalChartConfig = {
  resolutionId: '5S',
  seriesId: 'candlestick'
}
</script>

<template>
  <div class="terminal">
    <div class="terminal-chart">
      <TerminalChart
        :options="chartOptions"
        :expiration="chartState.expiration.chartExpiration"
        :asset-symbol="chartState.assetSymbol"
        :default-config="defaultConfig"
        :datafeed-factory="datafeedFactory"
      />
    </div>
    <div class="terminal-aside">
      <select
        :value="chartState.expiration.appExpiration"
        @change="setExpiration(expirations[($event.target as HTMLSelectElement).selectedIndex])"
      >
        <option v-for="exp in expirations" :key="exp.close + exp.type" :value="exp">
          {{ formatExp(exp.close) }}
        </option>
      </select>
      <div class="buy-buttons">
        <button @click="buyOption('up', chartState.expiration.appExpiration)">up</button>
        <button @click="buyOption('down', chartState.expiration.appExpiration)">down</button>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@use 'AppTerminal.scss';
</style>

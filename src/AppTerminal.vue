<script setup lang="ts">
import { computed, toRef } from 'vue'
import TerminalChart from '@chart/TerminalChart.vue'
import { useChart } from './useChart'
import { useQuoteHandler, useTrading } from './useTrading'
import { datafeedFactory } from './datafeedFactory'
import { helpers } from '@chart/helpers'
import BuyButton from './components/BuyButton.vue'
import ExpirationMenu from './components/ExpirationMenu.vue'
import type { TerminalChartConfig } from '@chart/types'

const { chartState } = useChart()
const { buyOption, options } = useTrading(toRef(() => chartState.value.assetSymbol.id))

useQuoteHandler(toRef(() => chartState.value.assetSymbol.id))

const chartOptions = computed(() =>
  options.value.map((option) => ({
    ...option,
    createdAt: helpers.dateToEpoch(option.createdAt),
    expirationDate: helpers.dateToEpoch(option.expirationDate)
  }))
)

const defaultConfig: TerminalChartConfig = {
  resolutionId: '5S',
  seriesId: 'candlestick'
}

const buy = (direction: 'up' | 'down') => {
  const currentExp = chartState.value.currentExpiration
  if (!currentExp) {
    throw `Expiration is required when buying`
  }
  buyOption(direction, currentExp.expiration)
}
</script>

<template>
  <div class="terminal">
    <div class="terminal-chart">
      <TerminalChart
        :options="chartOptions"
        :expiration="chartState.currentExpiration?.chartExpiration"
        :asset-symbol="chartState.assetSymbol"
        :default-config="defaultConfig"
        :datafeed-factory="datafeedFactory" />
    </div>
    <div class="terminal-aside">
      <ExpirationMenu />
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

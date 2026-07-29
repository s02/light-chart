<script setup lang="ts">
import AppTerminal from '@app/components/AppTerminal.vue'
import AssetButton from '@app/components/AssetButton.vue'
import { useExpirations } from '@app/composables/useExpirations'
import { runStateWatcher } from '@app/composables/useChartState'
import { runOptionsWatcher } from '@app/composables/useTrading'
import { useChartState } from '@app/composables/useChartState'

const { schedule: scheduleExpirationsUpdate } = useExpirations()
const { charts, setChartActive } = useChartState()

scheduleExpirationsUpdate()
runOptionsWatcher()
runStateWatcher()
</script>

<template>
  <div class="app">
    <div class="app-asset-menu">
      <AssetButton
        v-for="chart of charts"
        :key="chart.id"
        :name="chart.assetSymbol.name"
        :active="chart.active"
        :profitability="chart.profitability"
        @click="setChartActive(chart.id)" />
    </div>
    <div class="app-terminal" :class="{ split: charts.length > 1 }">
      <AppTerminal v-for="chart of charts" :key="chart.id" :chart-id="chart.id" />
    </div>
  </div>
</template>

<style lang="scss">
@import 'https://fonts.googleapis.com/css?family=IBM+Plex+Sans:300,400,500,600,700&display=swap&subset=cyrillic,cyrillic-ext,latin-ext';

*,
*::before,
*::after {
  box-sizing: border-box;
  scrollbar-width: thin;
  scrollbar-color: rgb(155 155 155 / 25%) transparent;
}

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  color: #fff;
  background-color: #001b36;
  line-height: 1.5;
  color-scheme: light dark;
  font-synthesis: none;
  font-family: 'IBM Plex Sans', sans-serif;
  text-rendering: optimizelegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
}

.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 18px;
  gap: 18px;
}

.app-terminal {
  flex-grow: 1;
  overflow: hidden;

  &.split {
    display: grid;
    grid-template-rows: repeat(2, minmax(0, 1fr));
  }
}

.app-asset-menu {
  display: flex;
  gap: 8px;
}

p {
  margin: 0;
  padding: 0;
}
</style>

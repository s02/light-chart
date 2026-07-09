<script setup lang="ts">
import AppTerminal from '@app/components/AppTerminal.vue'
import AssetButton from '@app/components/AssetButton.vue'
import { ASSETS, PROFITABILITY } from '@app/constants'
import { useChart } from '@app/composables/useChart'
import { useExpirations } from '@app/composables/useExpirations'

const { schedule: scheduleExpirationsUpdate } = useExpirations()
const { chartState, setChart } = useChart()
scheduleExpirationsUpdate()

const assetMenu = [
  {
    asset: ASSETS[0],
    profitability: PROFITABILITY.TURBO
  },
  {
    asset: ASSETS[1],
    profitability: PROFITABILITY.BINARY
  }
]

const openChart = (el: (typeof assetMenu)[0]) => {
  setChart(el.asset, el.profitability)
}
</script>

<template>
  <div class="app">
    <div class="app-asset-menu">
      <AssetButton
        v-for="el of assetMenu"
        :key="el.asset.id"
        :name="el.asset.name"
        :active="el.asset.id === chartState.assetSymbol.id"
        :profitability="el.profitability"
        @click="openChart(el)" />
    </div>
    <div class="app-terminal">
      <AppTerminal />
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
}

.app-asset-menu {
  display: flex;
  gap: 8px;
}
</style>

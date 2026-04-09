<script setup lang="ts">
import AppTerminal from './AppTerminal.vue'
import { ASSETS, useChart } from './useChart'
import { useExpirations } from './useExpirations'

const { schedule: scheduleExpirationsUpdate } = useExpirations()
const { chartState, setAssetSymbol } = useChart()
scheduleExpirationsUpdate()
</script>

<template>
  <div class="app">
    <div class="app-asset-menu">
      <select
        :value="chartState.assetSymbol.id"
        @change="setAssetSymbol(ASSETS[($event.target as HTMLSelectElement).selectedIndex])"
      >
        <option v-for="el of ASSETS" :key="el.id" :value="el.id">
          {{ el.name }}
        </option>
      </select>
    </div>
    <div class="app-terminal">
      <AppTerminal />
    </div>
  </div>
</template>

<style lang="scss">
@import 'https://fonts.googleapis.com/css?family=IBM+Plex+Sans:300,400,500,600,700&display=swap&subset=cyrillic,cyrillic-ext,latin-ext';

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  color: #fff;
  background-color: #001b36;
  line-height: 1.5;
  color-scheme: light dark;
  font-synthesis: none;
  font-family: 'IBM Plex Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizelegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
  margin: 0;
  padding: 0;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  scrollbar-width: thin;
  scrollbar-color: rgb(155 155 155 / 50%) transparent;
}

.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-terminal {
  flex-grow: 1;
}

.app-asset-menu {
  padding: 10px;
  display: flex;
  gap: 5px;
}
</style>

<script setup lang="ts">
import TerminalChart from '@chart/TerminalChart.vue'
import { DatafeedFactory } from '@datafeed/DatafeedFactory'
import { provide } from 'vue'

const props = defineProps<{ el: string }>()

const datafeedFactory = new DatafeedFactory('https://dev-api.bindev.info', 'wss://dev-ws.bindev.info')

provide('root-el', props.el)
</script>

<template>
  <TerminalChart
    :asset-symbol="{ id: '34', name: 'ETHEREUM' }"
    :default-config="{ resolutionId: '5S', seriesId: 'candlestick' }"
    :datafeed-factory="datafeedFactory" />
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import TerminalChart from '@chart/TerminalChart.vue'
import { useQuoteHandler, useTrading } from '@app/composables/useTrading'
import { helpers } from '@chart/helpers'
import BuyButton from '@app/components/BuyButton.vue'
import ExpirationMenu from '@app/components/ExpirationMenu.vue'
import { DatafeedFactory } from '@datafeed/DatafeedFactory'
import { Transport } from '@app/transport'
import TimezonesMenu from '@app/components/TimezonesMenu.vue'
import { useState } from '@app/composables/useState'
import type { Language } from '@chart/types'

const { state, setSeries, setResolution, setTimeZone, setLanguage } = useState()
const { buyOption, options } = useTrading(toRef(() => state.value.assetSymbol.id))
const datafeedFactory = new DatafeedFactory(Transport.get().http, Transport.get().ws)

useQuoteHandler(toRef(() => state.value.assetSymbol.id))

const chartOptions = computed(() =>
  options.value.map((option) => ({
    ...option,
    createdAt: helpers.toZonedDate(option.createdAt, state.value.timeZone),
    expirationDate: helpers.toZonedDate(option.expirationDate, state.value.timeZone),
    getSum() {
      return this.sum + '$'
    }
  }))
)

const buy = (direction: 'up' | 'down') => {
  const currentExp = state.value.currentExpiration
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
        root-el="#teleport"
        :language="state.language"
        :options="chartOptions"
        :expiration="state.currentExpiration?.chartExpiration"
        :asset-symbol="state.assetSymbol"
        :default-config="{
          resolutionId: state.resolutionId,
          seriesId: state.seriesId
        }"
        :time-zone="state.timeZone"
        :datafeed-factory="datafeedFactory"
        @series-changed="setSeries"
        @resolution-changed="setResolution" />
    </div>
    <div class="terminal-aside">
      <div class="terminal-menus">
        <ExpirationMenu />
        <TimezonesMenu :model-value="state.timeZone" @update:model-value="setTimeZone($event!)" />
        <select :value="state.language" @change="setLanguage(($event.target as HTMLSelectElement).value as Language)">
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

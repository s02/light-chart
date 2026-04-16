<script setup lang="ts">
import { onMounted, ref, toRef, watch } from 'vue'
import { useDatafeed } from '../useDatafeed'
import { RESOLUTION_SETTINGS, RESOLUTIONS, SERIES } from '../lib/constants'
import { useTrading } from '../useTrading'
import { useChart } from '../useChart'
import { useExpirations } from '../useExpirations'
import { Chart } from '../lib/Chart'
import { dateHelpers } from '../dateHelpers'

const { data: expirations, format: formatExp } = useExpirations()
const { chartState, setResolutionId, setSeriesId, setExpiration } = useChart()
const { create } = useDatafeed()
const { buyOption, options } = useTrading(toRef(() => chartState.value.assetSymbol.id))

let chart: Chart | null = null
const chartRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!chartState.value.expiration.chartExpiration) {
    throw 'No expirations'
  }

  chart = new Chart(chartRef.value!, {
    datafeed: create(chartState.value.assetSymbol, chartState.value.resolutionId),
    expiration: chartState.value.expiration.chartExpiration,
    onResolutionChange: setResolutionId,
    onSeriesChange: setSeriesId
  })
})

const addIndicator = () => {
  if (!chart) {
    return
  }

  chart.addIndicator()
}

watch(chartState, (nextState, prevState) => {
  if (!chart) {
    return
  }

  if (nextState.assetSymbol !== prevState.assetSymbol || nextState.resolutionId !== prevState.resolutionId) {
    chart.setDatafeed(create(nextState.assetSymbol, nextState.resolutionId))
  }

  if (nextState.seriesId !== prevState.seriesId) {
    chart.setSeriesId(nextState.seriesId)
  }

  if (
    nextState.expiration.chartExpiration &&
    nextState.expiration.chartExpiration.close !== prevState.expiration.chartExpiration?.close
  ) {
    chart.setExpiration(nextState.expiration.chartExpiration)
  }
})

watch(options, (next) => {
  if (chart) {
    chart.setOptions(
      next.map((option) => ({
        ...option,
        createdAt: dateHelpers.iso8601toTime(option.createdAt),
        expirationDate: dateHelpers.iso8601toTime(option.expirationDate)
      }))
    )
  }
})
</script>

<template>
  <div class="chart">
    <div ref="chartRef" class="chart-plot"></div>
    <div class="chart-aside">
      <select
        :value="chartState.expiration.appExpiration"
        @change="setExpiration(expirations[($event.target as HTMLSelectElement).selectedIndex])"
      >
        <option v-for="exp in expirations" :key="exp.close" :value="exp">
          {{ formatExp(exp.close) }}
        </option>
      </select>
      <div class="chart-buy">
        <button @click="buyOption('up', chartState.expiration.appExpiration)">up</button>
        <button @click="buyOption('down', chartState.expiration.appExpiration)">down</button>
      </div>
    </div>
    <div class="chart-footer">
      <div class="chart-controls">
        <div class="chart-buttons">
          <select
            :value="chartState.seriesId"
            @change="setSeriesId(SERIES[($event.target as HTMLSelectElement).selectedIndex])"
          >
            <option v-for="seriesId in SERIES" :key="seriesId" :value="seriesId">
              {{ seriesId }}
            </option>
          </select>
        </div>
        <div class="chart-buttons">
          <button @click="addIndicator()">SMA</button>
        </div>
        <div class="chart-buttons">
          <select
            :value="chartState.resolutionId"
            @change="setResolutionId(RESOLUTIONS[($event.target as HTMLSelectElement).selectedIndex])"
          >
            <option v-for="resolutionId in RESOLUTIONS" :key="resolutionId" :value="resolutionId">
              {{ RESOLUTION_SETTINGS[resolutionId].name }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chart {
  display: grid;
  grid-template-columns: 1fr 180px;
  grid-template-rows: 1fr min-content;
  width: 100%;
  height: 100%;
}

.chart-aside {
  grid-column: 2;
  grid-row: 1 / 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px 10px;

  select,
  button {
    width: 100%;
  }
}

.chart-buy {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 5px;
}

.chart-plot {
  grid-column: 1;
  grid-row: 1;
}

.chart-footer {
  grid-column: 1;
  grid-row: 2;
}

.chart-controls {
  padding: 10px;
  display: flex;
  justify-content: space-between;
}

.chart-buttons {
  display: flex;
  gap: 5px;
}
</style>

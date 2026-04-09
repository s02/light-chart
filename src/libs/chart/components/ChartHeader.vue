<script setup lang="ts">
import { useChart } from '@chart/useChart'
import { provideChartMenu } from '@chart/useChartMenu'
import { RESOLUTION_SETTINGS } from '@engine/constants'
import { useTemplateRef } from 'vue'
import ChartButton from '@chart/components/ChartButton.vue'
import ChartMenu from '@chart/components/ChartMenu.vue'
import ResolutionMenu from '@chart/components/ResolutionMenu.vue'
import SeriesMenu from '@chart/components/SeriesMenu.vue'
import SeriesIcon from '@chart/components/SeriesIcon.vue'

const { state } = useChart()

const btnRes = useTemplateRef('btnRes')
const { close: closeResMenu, open: openResMenu, key: resMenuKey } = provideChartMenu('res-menu', btnRes)

const btnSeries = useTemplateRef('btnSeries')
const { close: closeSeriesMenu, open: openSeriesMenu, key: seriesMenuKey } = provideChartMenu('series-menu', btnSeries)
</script>

<template>
  <div class="chart-header">
    <ChartButton ref="btnRes" class="btn-resolution" @click="openResMenu">
      {{ RESOLUTION_SETTINGS[state.resolutionId].name }}
    </ChartButton>
    <ChartMenu :menu-key="resMenuKey">
      <ResolutionMenu @selected="closeResMenu" />
    </ChartMenu>

    <div class="chart-header-separator"></div>

    <ChartButton ref="btnSeries" class="btn-series" @click="openSeriesMenu">
      <SeriesIcon :series-id="state.seriesId" />
    </ChartButton>
    <ChartMenu :menu-key="seriesMenuKey">
      <SeriesMenu @selected="closeSeriesMenu" />
    </ChartMenu>
  </div>
</template>

<style lang="scss" scoped>
@use 'ChartHeader.scss';
</style>

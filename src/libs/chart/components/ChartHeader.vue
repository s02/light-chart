<script setup lang="ts">
import { useChart } from '@chart/useChart'
import { provideChartMenu } from '@chart/useChartMenu'
import { RESOLUTION_SETTINGS } from '@engine/constants'
import { useTemplateRef } from 'vue'
import ChartMenu from '@chart/components/ChartMenu.vue'
import ResolutionMenu from '@chart/components/ResolutionMenu.vue'
import SeriesMenu from '@chart/components/SeriesMenu.vue'
import SeriesIcon from '@chart/components/SeriesIcon.vue'
import { useIndicators } from '@chart/useIndicators'
import StudyRepository from '@chart/components/StudyRepository/StudyRepository.vue'

const { state } = useChart()
const { openScriptList } = useIndicators()

const btnRes = useTemplateRef('btnRes')
const { close: closeResMenu, open: openResMenu, key: resMenuKey } = provideChartMenu('res-menu', btnRes)

const btnSeries = useTemplateRef('btnSeries')
const { close: closeSeriesMenu, open: openSeriesMenu, key: seriesMenuKey } = provideChartMenu('series-menu', btnSeries)
</script>

<template>
  <div class="chart-header">
    <div class="chart-header-side">
      <button ref="btnRes" class="chart-header-btn" @click="openResMenu">
        {{ RESOLUTION_SETTINGS[state.resolutionId].name }}
      </button>
      <ChartMenu :menu-key="resMenuKey">
        <ResolutionMenu @selected="closeResMenu" />
      </ChartMenu>

      <div class="chart-header-separator"></div>

      <button ref="btnSeries" class="chart-header-btn" @click="openSeriesMenu">
        <SeriesIcon :series-id="state.seriesId" />
      </button>
      <ChartMenu :menu-key="seriesMenuKey">
        <SeriesMenu @selected="closeSeriesMenu" />
      </ChartMenu>

      <div class="chart-header-separator"></div>

      <button class="chart-header-btn chart-header-btn-indicator" @click="openScriptList()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28" fill="none">
          <path
            stroke="currentColor"
            d="M20 17l-5 5M15 17l5 5M9 11.5h7M17.5 8a2.5 2.5 0 0 0-5 0v11a2.5 2.5 0 0 1-5 0"></path>
        </svg>
        Indicators
      </button>
    </div>

    <div class="chart-header-side">
      <StudyRepository />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'ChartHeader.scss';
</style>

<script setup lang="ts">
import ChartAsideButton from '@chart/components/ChartAsideButton.vue'
import LineDrawingMenu from '@chart/components/LineDrawingMenu.vue'
import ChartMenu from '@chart/components/ChartMenu.vue'
import { provideChartMenu } from '@chart/useChartMenu'
import { ref, useTemplateRef } from 'vue'
import LineIcon from '@chart/components/LineIcon.vue'
import type { DrawingName } from '@engine/drawings'
import { useEngine } from '@chart/composables/useEngine'

const {
  close: closeLineMenu,
  open: openLineMenu,
  key: lineMenuKey
} = provideChartMenu('line-menu', useTemplateRef('btnLineMenu'))

const { startDrawing } = useEngine()

const line = ref<DrawingName>('trend-line')
const initialized = ref<DrawingName | undefined>()

const selectDrawing = (id: DrawingName) => {
  line.value = id
  closeLineMenu()
  initializeDrawing(id)
}

const initializeDrawing = async (id: DrawingName) => {
  initialized.value = id
  await startDrawing(id)
  initialized.value = undefined
}
</script>

<template>
  <div class="chart-aside">
    <ChartAsideButton ref="btnLineMenu" @open="openLineMenu" @start="initializeDrawing(line)">
      <LineIcon :name="line" :class="{ initialized: initialized === line }" />
    </ChartAsideButton>

    <ChartMenu :menu-key="lineMenuKey" placement="top-end">
      <LineDrawingMenu @selected="selectDrawing" />
    </ChartMenu>

    <!-- <ChartAsideButton>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
        <g fill="currentColor" fill-rule="nonzero">
          <path d="M3 5h22v-1h-22z"></path>
          <path d="M3 17h22v-1h-22z"></path>
          <path d="M3 11h19.5v-1h-19.5z"></path>
          <path d="M5.5 23h19.5v-1h-19.5z"></path>
          <path
            d="M3.5 24c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5zM24.5 12c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm0 1c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5 2.5 1.119 2.5 2.5-1.119 2.5-2.5 2.5z"></path>
        </g>
      </svg>
    </ChartAsideButton>
    <ChartAsideButton>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
        <path
          fill="currentColor"
          d="M8 6.5c0-.28.22-.5.5-.5H14v16h-2v1h5v-1h-2V6h5.5c.28 0 .5.22.5.5V9h1V6.5c0-.83-.67-1.5-1.5-1.5h-12C7.67 5 7 5.67 7 6.5V9h1V6.5Z"></path>
      </svg>
    </ChartAsideButton> -->
  </div>
</template>

<style lang="scss" scoped>
@use 'ChartAside.scss';
</style>

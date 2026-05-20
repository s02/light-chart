<script setup lang="ts">
import { provideChartMenu } from '@chart/useChartMenu'
import ChartMenu from '@chart/components/ChartMenu.vue'
import type { ChartSeriesLegend } from '@engine/types'
import { ref, shallowRef } from 'vue'
import IndicatorLegendMenu from '@chart/components/IndicatorLegendMenu.vue'
import { useEngine } from '@chart/composables/useEngine'

defineProps<{ legends: ChartSeriesLegend[] }>()

const btnMenu = shallowRef<HTMLElement | null>(null)
const { close: closeMenu, open, key: menuKey } = provideChartMenu('indicators-menu', btnMenu)
const { removeIndicator, editIndicator } = useEngine()

const id = ref<number | null>(null)

const openMenu = (target: HTMLElement, currentId: number) => {
  btnMenu.value = target
  id.value = currentId
  open()
}

const handleMenuAction = (name: string) => {
  if (!id.value) {
    return
  }

  if (name === 'remove') {
    removeIndicator(id.value)
  }

  if (name === 'edit') {
    editIndicator(id.value)
  }

  closeMenu()
}
</script>

<template>
  <div class="chart-legends">
    <div v-for="legend in legends" :key="legend.id" class="chart-legend" :class="legend.category">
      <div v-if="legend.category !== 'main'" class="chart-legend-name">
        <span> {{ legend.key }}</span>
        <div class="chart-legend-menu" @click="openMenu($event.currentTarget as HTMLElement, legend.id)">
          <div class="chart-legend-name">{{ legend.key }}</div>
          <div class="chart-legend-menu-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18">
              <path
                fill="currentColor"
                fill-rule="evenodd"
                d="M3 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 1a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6-1a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 1a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm7-2a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm1 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div v-for="(d, i) in legend.data" :key="i">
        <span v-if="d.label">{{ d.label }}</span> <span :style="{ color: d.color }">{{ d.value }}</span>
      </div>
    </div>
  </div>

  <ChartMenu :menu-key="menuKey">
    <IndicatorLegendMenu @action="handleMenuAction" />
  </ChartMenu>
</template>

<style lang="scss" scoped>
@use 'ChartLegend.scss';
</style>

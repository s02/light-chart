<script setup lang="ts">
import type { ChartSeriesLegend } from '@engine/types'
import { ref } from 'vue'
import IndicatorLegendMenu from '@chart/components/IndicatorLegendMenu.vue'
import { useEngineApi } from '@chart/composables/useEngine'
import FloatingDropdown from '@chart/components/FloatingDropdown.vue'

defineProps<{ legends: ChartSeriesLegend[] }>()

const { removeIndicator, editIndicator } = useEngineApi()

const id = ref<number | null>(null)

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

  id.value = null
}
</script>

<template>
  <div class="chart-legends">
    <FloatingDropdown
      v-for="legend in legends"
      :key="legend.id"
      placement="right-start"
      :open="!!id"
      @update:open="id = null">
      <template #trigger="{ triggerRef }">
        <div class="chart-legend" :class="legend.category">
          <div v-if="legend.category !== 'main'" class="chart-legend-line">
            <span class="chart-legend-label">{{ legend.key }}</span>
            <div :ref="triggerRef" class="chart-legend-menu" @click="id = legend.id">
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
      </template>
      <IndicatorLegendMenu @action="handleMenuAction" />
    </FloatingDropdown>
  </div>
</template>

<style lang="scss" scoped>
@use 'ChartLegend.scss';
</style>

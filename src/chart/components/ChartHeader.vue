<script setup lang="ts">
import { RESOLUTION_SETTINGS } from '@engine/constants'
import { ref } from 'vue'
import ResolutionMenu from '@chart/components/ResolutionMenu.vue'
import SeriesMenu from '@chart/components/SeriesMenu.vue'
import SeriesIcon from '@chart/components/SeriesIcon.vue'
import { useIndicators } from '@chart/useIndicators'
import StudyRepository from '@chart/components/StudyRepository/StudyRepository.vue'
import FloatingDropdown from '@chart/components/FloatingDropdown.vue'
import type { ResolutionId, SeriesId } from '@engine/types'
import { i18n } from '@chart/i18n'

const emit = defineEmits<{
  (e: 'resolutionChanged', resolution: ResolutionId): void
  (e: 'seriesChanged', seriesId: SeriesId): void
}>()

defineProps<{ resolutionId: ResolutionId; seriesId: SeriesId }>()

const { openScriptList } = useIndicators()

const isResolutionMenuOpened = ref(false)
const isSeriesMenuOpened = ref(false)

const setResolutionId = (resolutionId: ResolutionId) => {
  emit('resolutionChanged', resolutionId)
  isResolutionMenuOpened.value = false
}

const setSeriesId = (seriesId: SeriesId) => {
  emit('seriesChanged', seriesId)
  isSeriesMenuOpened.value = false
}
</script>

<template>
  <div class="mwc-chart-header">
    <div class="mwc-chart-header-side">
      <FloatingDropdown :open="isResolutionMenuOpened" @update:open="isResolutionMenuOpened = false">
        <template #trigger="{ triggerRef }">
          <button
            v-if="resolutionId"
            :ref="triggerRef"
            class="mwc-chart-header-btn"
            @click="isResolutionMenuOpened = true">
            {{ RESOLUTION_SETTINGS[resolutionId].name }}
          </button>
        </template>
        <ResolutionMenu v-if="resolutionId" :active="resolutionId" @selected="setResolutionId" />
      </FloatingDropdown>

      <div class="mwc-chart-header-separator"></div>

      <FloatingDropdown :open="isSeriesMenuOpened" @update:open="isSeriesMenuOpened = false">
        <template #trigger="{ triggerRef }">
          <button v-if="seriesId" :ref="triggerRef" class="mwc-chart-header-btn" @click="isSeriesMenuOpened = true">
            <SeriesIcon :series-id="seriesId" />
          </button>
        </template>
        <SeriesMenu v-if="seriesId" :active="seriesId" @selected="setSeriesId" />
      </FloatingDropdown>

      <div class="mwc-chart-header-separator"></div>

      <button class="mwc-chart-header-btn mwc-chart-header-btn-indicator" @click="openScriptList()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28" fill="none">
          <path
            stroke="currentColor"
            d="M20 17l-5 5M15 17l5 5M9 11.5h7M17.5 8a2.5 2.5 0 0 0-5 0v11a2.5 2.5 0 0 1-5 0"></path>
        </svg>
        {{ i18n.translate('menu-indicators') }}
      </button>
    </div>

    <div class="mwc-chart-header-side">
      <StudyRepository />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'ChartHeader.scss';
</style>

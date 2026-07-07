<script setup lang="ts">
import ChartMenuGroup from '@chart/components/ChartMenuGroup.vue'
import ChartMenuItem from '@chart/components/ChartMenuItem.vue'
import { i18n } from '@chart/i18n'
import { useChart } from '@chart/useChart'
import { RESOLUTION_SETTINGS } from '@engine/constants'
import type { ResolutionId } from '@engine/types'

const emit = defineEmits<{
  (e: 'selected'): void
}>()

const { state } = useChart()

const groups: { name: string; values: ResolutionId[] }[] = [
  {
    name: 'seconds',
    values: ['1S', '5S', '10S', '15S', '30S']
  },
  {
    name: 'minutes',
    values: ['1', '2', '5', '10', '15', '30']
  },
  {
    name: 'hours',
    values: ['60', '120', '360', '720']
  }
]

const setResolution = (value: ResolutionId) => {
  state.resolutionId = value
  emit('selected')
}
</script>

<template>
  <div class="resolution-menu">
    <ChartMenuGroup v-for="group in groups" :key="group.name" :name="group.name">
      <ChartMenuItem
        v-for="resolutionId in group.values"
        :key="resolutionId"
        :active="resolutionId === state.resolutionId"
        @click="setResolution(resolutionId)"
        >{{ i18n.translate(`resolution-${RESOLUTION_SETTINGS[resolutionId].name}`) }}</ChartMenuItem
      >
    </ChartMenuGroup>
  </div>
</template>

<style lang="scss" scoped>
@use 'ResolutionMenu.scss';
</style>

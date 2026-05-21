<script setup lang="ts">
import ChartAsideButton from '@chart/components/ChartAsideButton.vue'
import LineDrawingMenu from '@chart/components/LineDrawingMenu.vue'
import ChartMenu from '@chart/components/ChartMenu.vue'
import { provideChartMenu } from '@chart/useChartMenu'
import { ref, useTemplateRef } from 'vue'
import LineIcon from '@chart/components/LineIcon.vue'
import { useEngine } from '@chart/composables/useEngine'
import type { DrawingName } from '@engine/drawings'

const {
  close: closeLineMenu,
  open: openLineMenu,
  key: lineMenuKey
} = provideChartMenu('line-menu', useTemplateRef('btnLineMenu'))

const { startDrawing } = useEngine()

const line = ref<DrawingName>('trend-line')
const initialized = ref<DrawingName | null>()

const selectDrawing = (name: DrawingName) => {
  line.value = name
  initialized.value = name
  closeLineMenu()
  init()
}

const init = async () => {
  const name = initialized.value
  if (!name) return

  try {
    await startDrawing(name)
  } catch {
    // cancelled by a subsequent add() call — expected
  } finally {
    if (initialized.value === name) {
      initialized.value = null
    }
  }
}

const handleStart = (name: DrawingName) => {
  if (initialized.value) {
    return
  }

  initialized.value = name
  init()
}
</script>

<template>
  <div class="chart-aside">
    <ChartAsideButton ref="btnLineMenu" @open="openLineMenu" @start="handleStart(line)">
      <LineIcon :name="line" :class="{ initialized: initialized === line }" />
    </ChartAsideButton>

    <ChartMenu :menu-key="lineMenuKey" placement="top-end">
      <LineDrawingMenu @selected="selectDrawing" />
    </ChartMenu>
  </div>
</template>

<style lang="scss" scoped>
@use 'ChartAside.scss';
</style>

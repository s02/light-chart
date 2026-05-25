<script setup lang="ts">
import ChartAsideButton from '@chart/components/ChartAsideButton.vue'
import DrawingMenu from '@chart/components/DrawingMenu.vue'
import ChartMenu from '@chart/components/ChartMenu.vue'
import { provideChartMenu } from '@chart/useChartMenu'
import { ref, useTemplateRef } from 'vue'
import DrawingIcon from '@chart/components/DrawingIcon.vue'
import { useEngine } from '@chart/composables/useEngine'
import type { DrawingGroup, DrawingName } from '@engine/drawings'

const { close: closeMenu, open: openMenu, key: menuKey } = provideChartMenu('line-menu', useTemplateRef('btnLineMenu'))

const { startDrawing } = useEngine()

const drawingGroup = ref<DrawingGroup | null>(null)
const line = ref<DrawingName>('trend-line')
const text = ref<DrawingName>('text')

const initialized = ref<DrawingName | null>()

const selectDrawing = (name: DrawingName) => {
  if (drawingGroup.value === 'lines') {
    line.value = name
  } else if (drawingGroup.value === 'text') {
    text.value = name
  }

  initialized.value = name
  closeMenu()
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

const open = (group: DrawingGroup) => {
  drawingGroup.value = group
  openMenu()
}
</script>

<template>
  <div class="chart-aside">
    <ChartAsideButton ref="btnLineMenu" @open="open('lines')" @start="handleStart(line)">
      <DrawingIcon :name="line" :class="{ initialized: initialized === line }" />
    </ChartAsideButton>

    <ChartAsideButton ref="btnTextMenu" @open="open('text')" @start="handleStart(text)">
      <DrawingIcon :name="text" :class="{ initialized: initialized === text }" />
    </ChartAsideButton>

    <ChartMenu :menu-key="menuKey" placement="top-end">
      <DrawingMenu v-if="drawingGroup" :group="drawingGroup" @selected="selectDrawing" />
    </ChartMenu>
  </div>
</template>

<style lang="scss" scoped>
@use 'ChartAside.scss';
</style>

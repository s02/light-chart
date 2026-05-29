<script setup lang="ts">
import ChartMenu from '@chart/components/ChartMenu.vue'
import ChartMenuItem from '@chart/components/ChartMenuItem.vue'
import ChartMenuGroup from '@chart/components/ChartMenuGroup.vue'
import { provideChartMenu } from '@chart/useChartMenu'
import { computed, reactive, ref, shallowRef, useTemplateRef } from 'vue'
import { useEngine } from '@chart/composables/useEngine'
import { DRAWINGS, type DrawingGroup, type DrawingName } from '@engine/drawings'
import { i18n } from '@chart/i18n'

const { startDrawing } = useEngine()

const drawings = reactive<Record<DrawingGroup, DrawingName>>({ lines: 'trend-line', text: 'text' })
const groups = computed(() => Object.keys(drawings) as DrawingGroup[])

const currentDrawingGroup = ref<DrawingGroup | null>(null)
const currentGroupItems = computed(() => DRAWINGS.filter((drawing) => drawing.group === currentDrawingGroup.value))

const icons = computed<Record<DrawingGroup, string>>(() => ({
  lines: DRAWINGS.find((s) => s.drawing.ikey === drawings.lines)!.icon,
  text: DRAWINGS.find((s) => s.drawing.ikey === drawings.text)!.icon
}))

const btns = useTemplateRef('btn')
const activeBtn = shallowRef<NonNullable<typeof btns.value>[number] | null>(null)
const { close: closeMenu, open: openMenu, key: menuKey } = provideChartMenu('line-menu', activeBtn)

const initialized = ref<DrawingName | null>()

const selectDrawing = (name: DrawingName) => {
  if (currentDrawingGroup.value === 'lines') {
    drawings.lines = name
  } else if (currentDrawingGroup.value === 'text') {
    drawings.text = name
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

const open = (group: DrawingGroup, i: number) => {
  currentDrawingGroup.value = group
  activeBtn.value = btns.value?.[i] ?? null
  openMenu()
}
</script>

<template>
  <div class="chart-aside">
    <div v-for="(g, i) in groups" :key="g" ref="btn" class="ca-btn">
      <div
        class="ca-btn-icon"
        :class="{ initialized: initialized === drawings[g] }"
        @click="handleStart(drawings[g])"
        v-html="icons[g]"></div>

      <div class="ca-btn-collapse" @click="open(g, i)">
        <svg class="ca-btn-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 16" width="4" height="7">
          <path d="M.6 1.4l1.4-1.4 8 8-8 8-1.4-1.4 6.389-6.532-6.389-6.668z" stroke="currentColor"></path>
        </svg>
      </div>
    </div>

    <ChartMenu :menu-key="menuKey" placement="top-end">
      <div v-if="currentDrawingGroup" class="ca-drawing-menu">
        <ChartMenuGroup :name="currentDrawingGroup">
          <ChartMenuItem
            v-for="item in currentGroupItems"
            :key="item.drawing.ikey"
            @click="selectDrawing(item.drawing.ikey)">
            <div v-html="item.icon"></div>
            {{ i18n.translate(`draw-line-${item.drawing.ikey}`) }}
          </ChartMenuItem>
        </ChartMenuGroup>
      </div>
    </ChartMenu>
  </div>
</template>

<style lang="scss" scoped>
@use 'ChartAside.scss';
</style>

<script setup lang="ts">
import ChartMenu from '@chart/components/ChartMenu.vue'
import ChartMenuItem from '@chart/components/ChartMenuItem.vue'
import ChartMenuGroup from '@chart/components/ChartMenuGroup.vue'
import { provideChartMenu } from '@chart/useChartMenu'
import { ref, shallowRef, useTemplateRef } from 'vue'
import { useEngine } from '@chart/composables/useEngine'
import { DRAWINGS } from '@engine/drawings'
import { i18n } from '@chart/i18n'
import type { DrawingGroup, DrawingName, DrawingScript } from '@engine/drawings'

type AsideMenu = Record<DrawingGroup, DrawingScript>

const getDrawingGroups = () => {
  const s = new Set()

  DRAWINGS.forEach((d) => {
    s.add(d.group)
  })

  return Array.from(s) as DrawingGroup[]
}

const getDrawingSubgroups = (group: DrawingGroup) => {
  const s = new Set()

  DRAWINGS.filter((d) => d.group === group).forEach((d) => {
    s.add(d.subgroup)
  })

  return Array.from(s) as string[]
}

const getDrawingItems = (subg: string) => {
  return DRAWINGS.filter((d) => d.subgroup === subg)
}

const getDrawingInitials = () => {
  const result = {} as AsideMenu

  groups.forEach((g) => {
    result[g] = DRAWINGS.find((d) => d.group === g)!
  })

  return result
}

const { startDrawing } = useEngine()

const groups = getDrawingGroups()
const menu = ref<AsideMenu>(getDrawingInitials())

const initialized = ref<DrawingName | null>()
const currentDrawingGroup = ref<DrawingGroup | null>(null)

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

const btns = useTemplateRef('btn')
const activeBtn = shallowRef<NonNullable<typeof btns.value>[number] | null>(null)
const { close: closeMenu, open: openMenu, key: menuKey } = provideChartMenu('line-menu', activeBtn)

const selectDrawing = (script: DrawingScript) => {
  if (!currentDrawingGroup.value) {
    return
  }

  menu.value[currentDrawingGroup.value] = script
  handleStart(script.drawing.ikey)
  closeMenu()
}
</script>

<template>
  <div class="chart-aside">
    <div v-for="(g, i) in groups" :key="g" ref="btn" class="ca-btn">
      <div
        class="ca-btn-icon"
        :class="{ initialized: initialized === menu[g].drawing.ikey }"
        @click="handleStart(menu[g].drawing.ikey)"
        v-html="menu[g].icon"></div>

      <div class="ca-btn-collapse" @click="open(g, i)">
        <svg class="ca-btn-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 16" width="4" height="7">
          <path d="M.6 1.4l1.4-1.4 8 8-8 8-1.4-1.4 6.389-6.532-6.389-6.668z" stroke="currentColor"></path>
        </svg>
      </div>
    </div>

    <ChartMenu :menu-key="menuKey" placement="right-start">
      <div v-if="currentDrawingGroup" class="ca-drawing-menu">
        <ChartMenuGroup v-for="subg in getDrawingSubgroups(currentDrawingGroup)" :key="subg" :name="subg">
          <ChartMenuItem
            v-for="item in getDrawingItems(subg)"
            :key="item.drawing.ikey"
            class="ca-menu-item"
            @click="selectDrawing(item)">
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

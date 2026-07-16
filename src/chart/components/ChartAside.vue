<script setup lang="ts">
import ChartMenuItem from '@chart/components/ChartMenuItem.vue'
import ChartMenuGroup from '@chart/components/ChartMenuGroup.vue'
import { ref } from 'vue'
import { useEngineApi } from '@chart/composables/useEngine'
import { DRAWINGS } from '@engine/drawings'
import { i18n } from '@chart/i18n'
import FloatingDropdown from '@chart/components/FloatingDropdown.vue'
import EmojiList from '@chart/components/EmojiList.vue'
import type { DrawingGroup, DrawingName, DrawingOptions, DrawingScript } from '@engine/drawings/types'

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

const { startDrawing, cancelDrawing, removeAllDrawings, removeAllIndicators } = useEngineApi()

const groups = getDrawingGroups()
const menu = ref<AsideMenu>(getDrawingInitials())

const initialized = ref<DrawingName | null>()
const openedMenu = ref<{ type: 'drawing'; el: DrawingGroup } | { type: 'action'; el: 'remove' } | undefined>(undefined)

const init = async (name: DrawingName, { options, manualStop }: { options?: DrawingOptions; manualStop?: boolean }) => {
  try {
    await startDrawing(name, options)
    if (manualStop) {
      init(name, { options, manualStop })
    }
  } catch {
    // cancelled by a subsequent add() call — expected
  } finally {
    if (!manualStop) {
      if (initialized.value === name) {
        initialized.value = null
      }
    }
  }
}

const handleStart = (name: DrawingName, options?: DrawingOptions) => {
  openedMenu.value = undefined
  console.log('start', name, initialized.value)
  if (name === initialized.value) {
    initialized.value = null
    cancelDrawing()
  } else {
    initialized.value = name
    const drawing = DRAWINGS.find((d) => d.drawing.ikey === name)
    init(name, { options, manualStop: drawing?.manualStop })
  }
}

const selectDrawing = (script: DrawingScript) => {
  if (!openedMenu.value || openedMenu.value.type !== 'drawing') {
    return
  }

  menu.value[openedMenu.value.el] = script
  handleStart(script.drawing.ikey)
  close()
}

const removeDrawings = () => {
  removeAllDrawings()
  openedMenu.value = undefined
}

const removeIndicators = () => {
  removeAllIndicators()
  openedMenu.value = undefined
}

const removeStudies = () => {
  removeDrawings()
  removeIndicators()
}
</script>

<template>
  <FloatingDropdown
    v-for="g in groups"
    :key="g"
    :open="openedMenu?.el === g"
    placement="right-start"
    @update:open="openedMenu = undefined">
    <template #trigger="{ triggerRef }">
      <div :ref="triggerRef" class="mwc-ca-btn">
        <div
          class="mwc-ca-btn-icon"
          :class="{ initialized: initialized === menu[g].drawing.ikey }"
          @click="handleStart(menu[g].drawing.ikey)"
          v-html="menu[g].icon"></div>
        <div
          class="mwc-ca-btn-collapse"
          :class="{ opened: openedMenu?.el === g }"
          @click="openedMenu ? (openedMenu = undefined) : (openedMenu = { type: 'drawing', el: g })">
          <svg class="mwc-ca-btn-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 16" width="4" height="7">
            <path d="M.6 1.4l1.4-1.4 8 8-8 8-1.4-1.4 6.389-6.532-6.389-6.668z" stroke="currentColor"></path>
          </svg>
        </div>
      </div>
    </template>

    <div v-if="openedMenu?.el == 'emoji'" class="mwc-ca-emoji-menu">
      <EmojiList @click="handleStart('emoji', { params: { emoji: $event } })" />
    </div>

    <div v-else class="mwc-ca-drawing-menu">
      <ChartMenuGroup v-for="subg in getDrawingSubgroups(g)" :key="subg" :name="subg">
        <ChartMenuItem
          v-for="item in getDrawingItems(subg)"
          :key="item.drawing.ikey"
          class="mwc-ca-menu-item"
          @click="selectDrawing(item)">
          <div v-html="item.icon"></div>
          {{ i18n.translate(`study-${item.drawing.ikey}`) }}
        </ChartMenuItem>
      </ChartMenuGroup>
    </div>
  </FloatingDropdown>

  <div class="mwc-ca-splitter"></div>

  <FloatingDropdown :open="openedMenu?.el === 'remove'" placement="right-start" @update:open="openedMenu = undefined">
    <template #trigger="{ triggerRef }">
      <div :ref="triggerRef" class="mwc-ca-btn">
        <div class="mwc-ca-btn-icon" @click="removeStudies">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
            <path
              fill="currentColor"
              d="M18 7h5v1h-2.01l-1.33 14.64a1.5 1.5 0 0 1-1.5 1.36H9.84a1.5 1.5 0 0 1-1.49-1.36L7.01 8H5V7h5V6c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v1Zm-6-2a1 1 0 0 0-1 1v1h6V6a1 1 0 0 0-1-1h-4ZM8.02 8l1.32 14.54a.5.5 0 0 0 .5.46h8.33a.5.5 0 0 0 .5-.46L19.99 8H8.02Z"></path>
          </svg>
        </div>
        <div
          class="mwc-ca-btn-collapse"
          :class="{ opened: openedMenu?.el === 'remove' }"
          @click="openedMenu = { type: 'action', el: 'remove' }">
          <svg class="mwc-ca-btn-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 16" width="4" height="7">
            <path d="M.6 1.4l1.4-1.4 8 8-8 8-1.4-1.4 6.389-6.532-6.389-6.668z" stroke="currentColor"></path>
          </svg>
        </div>
      </div>
    </template>

    <div class="mwc-ca-drawing-menu">
      <ChartMenuGroup>
        <ChartMenuItem class="mwc-ca-menu-item" @click="removeDrawings">{{
          i18n.translate('menu-remove-drawings')
        }}</ChartMenuItem>
        <ChartMenuItem class="mwc-ca-menu-item" @click="removeIndicators">{{
          i18n.translate('menu-remove-indicators')
        }}</ChartMenuItem>
        <ChartMenuItem class="mwc-ca-menu-item" @click="removeStudies">{{
          i18n.translate('menu-remove-drawings-indicators')
        }}</ChartMenuItem>
      </ChartMenuGroup>
    </div>
  </FloatingDropdown>
</template>

<style lang="scss" scoped>
@use 'ChartAside.scss';
</style>

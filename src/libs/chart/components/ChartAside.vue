<script setup lang="ts">
import ChartMenuItem from '@chart/components/ChartMenuItem.vue'
import ChartMenuGroup from '@chart/components/ChartMenuGroup.vue'
import { ref } from 'vue'
import { useEngineApi } from '@chart/composables/useEngine'
import { DRAWINGS } from '@engine/drawings'
import { i18n } from '@chart/i18n'
import ChartAsideButton from '@chart/components/ChartAsideButton.vue'
import FloatingDropdown from '@chart/components/Dropdown/FloatingDropdown.vue'
import type { DrawingGroup, DrawingName, DrawingOptions, DrawingScript } from '@engine/drawings/types'
import EmojiList from '@chart/components/EmojiList.vue'

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

const { startDrawing, cancelDrawing } = useEngineApi()

const groups = getDrawingGroups()
const menu = ref<AsideMenu>(getDrawingInitials())

const initialized = ref<DrawingName | null>()
const currentDrawingGroup = ref<DrawingGroup | null>(null)

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
  currentDrawingGroup.value = null
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
  if (!currentDrawingGroup.value) {
    return
  }

  menu.value[currentDrawingGroup.value] = script
  handleStart(script.drawing.ikey)
  close()
}
</script>

<template>
  <div class="chart-aside">
    <FloatingDropdown
      v-for="g in groups"
      :key="g"
      :open="currentDrawingGroup === g"
      placement="right-start"
      @update:open="currentDrawingGroup = null">
      <template #trigger="{ triggerRef }">
        <ChartAsideButton
          :ref="triggerRef"
          :initialized="initialized === menu[g].drawing.ikey"
          :opened="currentDrawingGroup === g"
          :icon="menu[g].icon"
          @toggle="currentDrawingGroup ? (currentDrawingGroup = null) : (currentDrawingGroup = g)"
          @click="handleStart(menu[g].drawing.ikey)" />
      </template>

      <div v-if="currentDrawingGroup == 'emoji'" class="ca-emoji-menu">
        <EmojiList @click="handleStart('emoji', { params: { emoji: $event } })" />
      </div>
      <div v-else class="ca-drawing-menu">
        <ChartMenuGroup v-for="subg in getDrawingSubgroups(g)" :key="subg" :name="subg">
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
    </FloatingDropdown>
  </div>
</template>

<style lang="scss" scoped>
@use 'ChartAside.scss';
</style>

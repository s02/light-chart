<script setup lang="ts">
import ChartMenuItem from '@chart/components/ChartMenuItem.vue'
import LineIcon from '@chart/components/LineIcon.vue'
import ChartMenuGroup from '@chart/components/ChartMenuGroup.vue'
import { i18n } from '@chart/i18n'
import { DRAWINGS } from '@engine/drawings'
import type { DrawingGroup, DrawingName } from '@engine/drawings'

const emit = defineEmits<{
  (e: 'selected', name: DrawingName): void
}>()

const group: DrawingGroup = 'lines'
const items = DRAWINGS.filter((drawing) => drawing.group === group)
</script>

<template>
  <div class="line-drawing-menu">
    <ChartMenuGroup :name="group">
      <ChartMenuItem v-for="item in items" :key="item.drawing.ikey" @click="emit('selected', item.drawing.ikey)">
        <LineIcon :name="item.drawing.ikey" />
        {{ i18n.translate(`draw-line-${item.drawing.ikey}`) }}
      </ChartMenuItem>
    </ChartMenuGroup>
  </div>
</template>

<style lang="scss" scoped>
@use 'LineDrawingMenu.scss';
</style>

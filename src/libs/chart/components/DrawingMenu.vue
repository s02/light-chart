<script setup lang="ts">
import ChartMenuItem from '@chart/components/ChartMenuItem.vue'
import DrawingIcon from '@chart/components/DrawingIcon.vue'
import ChartMenuGroup from '@chart/components/ChartMenuGroup.vue'
import { i18n } from '@chart/i18n'
import { DRAWINGS } from '@engine/drawings'
import type { DrawingGroup, DrawingName } from '@engine/drawings'

const emit = defineEmits<{
  (e: 'selected', name: DrawingName): void
}>()

const props = defineProps<{ group: DrawingGroup }>()

const items = DRAWINGS.filter((drawing) => drawing.group === props.group)
</script>

<template>
  <div class="line-drawing-menu">
    <ChartMenuGroup :name="group">
      <ChartMenuItem v-for="item in items" :key="item.drawing.ikey" @click="emit('selected', item.drawing.ikey)">
        <DrawingIcon :name="item.drawing.ikey" />
        {{ i18n.translate(`draw-line-${item.drawing.ikey}`) }}
      </ChartMenuItem>
    </ChartMenuGroup>
  </div>
</template>

<style lang="scss" scoped>
@use 'DrawingMenu.scss';
</style>

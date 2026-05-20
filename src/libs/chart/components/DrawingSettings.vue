<script lang="ts" setup>
import ChartMenu from '@chart/components/ChartMenu.vue'
import ColorPicker from '@chart/components/ColorPicker.vue'
import LineWidthPicker from '@chart/components/LineWidthPicker.vue'
import { useDrawingSettings } from '@chart/composables/useDrawingSettings'
import { provideChartMenu } from '@chart/useChartMenu'
import { onClickOutside } from '@vueuse/core'
import { onUnmounted, ref, useTemplateRef, watchEffect } from 'vue'
import type { DrawingSchema } from '@engine/drawings'

type ParamKey = keyof DrawingSchema['params']
type ParamValue = DrawingSchema['params'][ParamKey]

const { drawingSchema, update, set, remove } = useDrawingSettings()
const dwsBtn = useTemplateRef('dws')
const colorPickerRef = useTemplateRef<HTMLElement>('colorPicker')
const linesPickerRef = useTemplateRef<HTMLElement>('linesPicker')

onClickOutside(
  dwsBtn,
  () => {
    set(null)
    editSettings.value = null
  },
  { ignore: [colorPickerRef, linesPickerRef] }
)

const params = ref<DrawingSchema['params'] | null>(null)
const editSettings = ref<ParamKey | null>(null)

const apply = (val: ParamValue) => {
  if (params.value && editSettings.value) {
    params.value = {
      ...params.value,
      [editSettings.value]: val
    }

    update(params.value)
    editSettings.value = null
  }

  closeMenuColor()
  closeMenuLine()
  editSettings.value = null
}

watchEffect(() => {
  if (drawingSchema.value) {
    params.value = { ...drawingSchema.value.params }
  } else {
    params.value = null
  }
})

const { close: closeMenuColor, open: openMenuColor, key: colorMenuKey } = provideChartMenu('color-menu', dwsBtn)
const { close: closeMenuLine, open: openMenuLine, key: lineMenuKey } = provideChartMenu('line-menu', dwsBtn)

const openColorMenu = (key: string) => {
  editSettings.value = key
  openMenuColor()
}

const openLineMenu = (key: string) => {
  editSettings.value = key
  openMenuLine()
}

onUnmounted(() => {
  set(null)
  editSettings.value = null
})
</script>

<template>
  <div>
    <div v-if="drawingSchema && params" ref="dws" class="drawing-settings">
      <div class="drawing-settings-handle">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 12" width="8" height="12" fill="currentColor">
          <rect width="2" height="2" rx="1"></rect>
          <rect width="2" height="2" rx="1" y="5"></rect>
          <rect width="2" height="2" rx="1" y="10"></rect>
          <rect width="2" height="2" rx="1" x="6"></rect>
          <rect width="2" height="2" rx="1" x="6" y="5"></rect>
          <rect width="2" height="2" rx="1" x="6" y="10"></rect>
        </svg>
      </div>
      <div v-for="el in drawingSchema.schema.inputs" :key="el.key">
        <div class="drw-btn drw-btn-w" :class="{ active: editSettings === el.key }" @click="openLineMenu(el.key)">
          <div class="drw-btn-w-line" :style="{ height: `${params[el.key]}px` }"></div>
          <div class="drw-btn-w-label">{{ params[el.key] }}px</div>
        </div>
      </div>
      <div v-for="el in drawingSchema.schema.style" :key="el.key">
        <div class="drw-btn drw-btn-c" :class="{ active: editSettings === el.key }" @click="openColorMenu(el.key)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
            <path
              fill="currentColor"
              d="M10.62.72a2.47 2.47 0 0 1 3.5 0l1.16 1.16c.96.97.96 2.54 0 3.5l-.58.58-8.9 8.9-1 1-.14.14H0v-4.65l.14-.15 1-1 8.9-8.9.58-.58Zm2.8.7a1.48 1.48 0 0 0-2.1 0l-.23.23 3.26 3.26.23-.23c.58-.58.58-1.52 0-2.1l-1.16-1.16Zm.23 4.2-3.26-3.27-8.2 8.2 3.25 3.27 8.2-8.2Zm-8.9 8.9-3.27-3.26-.5.5V15h3.27l.5-.5Z"></path>
          </svg>
          <div class="drw-btn-c-line" :style="{ backgroundColor: `${params[el.key]}` }"></div>
        </div>
      </div>
      <div class="drw-btn" @click="remove()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
          <path
            fill="currentColor"
            d="M18 7h5v1h-2.01l-1.33 14.64a1.5 1.5 0 0 1-1.5 1.36H9.84a1.5 1.5 0 0 1-1.49-1.36L7.01 8H5V7h5V6c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v1Zm-6-2a1 1 0 0 0-1 1v1h6V6a1 1 0 0 0-1-1h-4ZM8.02 8l1.32 14.54a.5.5 0 0 0 .5.46h8.33a.5.5 0 0 0 .5-.46L19.99 8H8.02Z"></path>
        </svg>
      </div>
    </div>

    <ChartMenu :menu-key="colorMenuKey">
      <ColorPicker ref="colorPicker" @select="apply" />
    </ChartMenu>

    <ChartMenu :menu-key="lineMenuKey">
      <LineWidthPicker ref="linesPicker" @select="apply" />
    </ChartMenu>
  </div>
</template>

<style lang="scss" scoped>
@use 'DrawingSettings.scss';
</style>

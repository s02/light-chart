<script lang="ts" setup>
import ChartMenu from '@chart/components/ChartMenu.vue'
import ColorPicker from '@chart/components/ColorPicker.vue'
import LineWidthPicker from '@chart/components/LineWidthPicker.vue'
import { provideChartMenu } from '@chart/useChartMenu'
import { onClickOutside } from '@vueuse/core'
import { onUnmounted, ref, useTemplateRef } from 'vue'
import DrawingPropLineColor from '@chart/components/DrawingSettings/DrawingPropLineColor.vue'
import DrawingPropFontSize from '@chart/components/DrawingSettings/DrawingPropFontSize.vue'
import DrawingPropFillColor from '@chart/components/DrawingSettings/DrawingPropFillColor.vue'
import DrawingPropTextColor from '@chart/components/DrawingSettings/DrawingPropTextColor.vue'
import DrawingPropLineWidth from '@chart/components/DrawingSettings/DrawingPropLineWidth.vue'
import DrawingPropBrushWidth from '@chart/components/DrawingSettings/DrawingPropBrushWidth.vue'
import FontSizePicker from '@chart/components/FontSizePicker.vue'
import DrawingPropText from '@chart/components/DrawingSettings/DrawingPropText.vue'
import type { DrawingSchema } from '@engine/drawings/types'
import type { StudyParamDescriptor } from '@engine/schema'
import { useEngineApi } from '@chart/composables/useEngine'

type ParamKey = keyof DrawingSchema['params']
type ParamValue = DrawingSchema['params'][ParamKey]
type MenuType = 'line' | 'color' | 'font'
const { updateDrawing, removeDrawing, drawingSchema, selectDrawing } = useEngineApi()
const dwsBtn = useTemplateRef('dws')
const colorPickerRef = useTemplateRef<HTMLElement>('colorPicker')
const linesPickerRef = useTemplateRef<HTMLElement>('linesPicker')
const fontPickerRef = useTemplateRef<HTMLElement>('fontPicker')

onClickOutside(
  dwsBtn,
  () => {
    editSettings.value = null
    selectDrawing(null)
  },
  { ignore: [colorPickerRef, linesPickerRef, fontPickerRef] }
)

const editSettings = ref<{ el: StudyParamDescriptor; type: MenuType } | null>(null)

const apply = (key: string, val: ParamValue) => {
  if (!drawingSchema.value) {
    return
  }

  updateDrawing({
    ...drawingSchema.value.params,
    [key]: val
  })
}

const { close: closeMenu, open: openMenu, key: menuKey } = provideChartMenu('menu', dwsBtn)

const open = (el: StudyParamDescriptor, type: MenuType) => {
  if (editSettings.value && el.key === editSettings.value.el.key) {
    editSettings.value = null
    return
  }

  editSettings.value = { el, type }
  openMenu()
}

const close = () => {
  editSettings.value = null
  closeMenu()
}

onUnmounted(() => {
  selectDrawing(null)
  editSettings.value = null
})
</script>

<template>
  <div v-if="drawingSchema">
    <div ref="dws" class="drawing-settings">
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
      <template v-for="el in drawingSchema.schema.inputs" :key="el.key">
        <DrawingPropText
          v-if="el.key === 'text'"
          :text="String(drawingSchema.params[el.key])"
          @select="apply('text', $event)" />
        <DrawingPropBrushWidth
          v-if="el.key === 'brush-width'"
          :width="Number(drawingSchema.params[el.key])"
          @click="open(el, 'line')" />
        <DrawingPropLineWidth
          v-if="el.key === 'line-width'"
          :width="Number(drawingSchema.params[el.key])"
          @click="open(el, 'line')" />
      </template>
      <template v-for="el in drawingSchema.schema.style" :key="el.key">
        <DrawingPropFontSize
          v-if="el.key === 'font-size'"
          :width="Number(drawingSchema.params[el.key])"
          @click="open(el, 'font')" />
        <DrawingPropLineColor
          v-else-if="el.key === 'line-color'"
          :color="String(drawingSchema.params[el.key])"
          @click="open(el, 'color')" />
        <DrawingPropFillColor
          v-else-if="el.key === 'fill'"
          :color="String(drawingSchema.params[el.key])"
          @click="open(el, 'color')" />
        <DrawingPropTextColor
          v-else-if="el.key === 'text-color'"
          :color="String(drawingSchema.params[el.key])"
          @click="open(el, 'color')" />
      </template>
      <div class="drw-btn" @click="removeDrawing()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
          <path
            fill="currentColor"
            d="M18 7h5v1h-2.01l-1.33 14.64a1.5 1.5 0 0 1-1.5 1.36H9.84a1.5 1.5 0 0 1-1.49-1.36L7.01 8H5V7h5V6c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v1Zm-6-2a1 1 0 0 0-1 1v1h6V6a1 1 0 0 0-1-1h-4ZM8.02 8l1.32 14.54a.5.5 0 0 0 .5.46h8.33a.5.5 0 0 0 .5-.46L19.99 8H8.02Z"></path>
        </svg>
      </div>
    </div>

    <ChartMenu :menu-key="menuKey">
      <template v-if="editSettings">
        <ColorPicker
          v-if="editSettings.type === 'color'"
          ref="colorPicker"
          :color="`${drawingSchema.params[editSettings.el.key]}`"
          @select="apply(editSettings.el.key, $event)"
          @close="close()" />

        <LineWidthPicker
          v-else-if="editSettings.type === 'line'"
          ref="linesPicker"
          :width="Number(drawingSchema.params[editSettings.el.key])"
          :options="editSettings.el.type === 'number' ? editSettings.el.options : undefined"
          @select="apply(editSettings.el.key, $event)"
          @close="close()" />

        <FontSizePicker
          v-else-if="editSettings.type === 'font'"
          ref="fontPicker"
          :size="Number(drawingSchema.params[editSettings.el.key])"
          @select="apply(editSettings.el.key, $event)"
          @close="close()" />
      </template>
    </ChartMenu>
  </div>
</template>

<style lang="scss" scoped>
@use 'DrawingSettings.scss';
@use 'btn.scss';
</style>

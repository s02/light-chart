<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core'
import { computed, onUnmounted, ref, useTemplateRef } from 'vue'
import DrawingPropLineColor from '@chart/components/DrawingSettings/DrawingPropLineColor.vue'
import DrawingPropFontSize from '@chart/components/DrawingSettings/DrawingPropFontSize.vue'
import DrawingPropLineWidth from '@chart/components/DrawingSettings/DrawingPropLineWidth.vue'
import DrawingPropBrushWidth from '@chart/components/DrawingSettings/DrawingPropBrushWidth.vue'
import DrawingPropFillColor from '@chart/components/DrawingSettings/DrawingPropFillColor.vue'
import DrawingPropTextColor from '@chart/components/DrawingSettings/DrawingPropTextColor.vue'
import { useEngineApi } from '@chart/composables/useEngine'
import { useModal } from '@chart/composables/useModal'
import StudySettings from '@chart/components/Study/StudySettings.vue'
import type { DrawingSchema } from '@engine/drawings/types'
import type { StudyParamDescriptor, StudySchema } from '@engine/schema'

type ParamKey = keyof DrawingSchema['params']
type ParamValue = DrawingSchema['params'][ParamKey]
type MenuType = 'line' | 'color' | 'font'

const { updateDrawing, removeDrawing, drawingSchema, selectDrawing } = useEngineApi()
const { open: openModal } = useModal()

const isSettingsOpened = ref(false)
const isPanelMenuOpened = ref(false)

const fastPanel = computed(() => {
  if (!drawingSchema.value) {
    return []
  }

  return [
    ...drawingSchema.value.schema.style.filter((param) => param.fastPanel),
    ...drawingSchema.value.schema.text.filter((param) => param.fastPanel)
  ]
})

const availableSettings = computed(() => {
  const result: StudySchema = {
    inputs: [],
    text: [],
    style: []
  }

  if (!drawingSchema.value) {
    return result
  }

  result.inputs = drawingSchema.value.schema.inputs.filter((p) => !p.fastPanel)
  result.text = drawingSchema.value.schema.text.filter((p) => !p.fastPanel)
  result.style = drawingSchema.value.schema.style.filter((p) => !p.fastPanel)

  return result
})

const hasSettings = computed(
  () =>
    availableSettings.value.inputs.length || availableSettings.value.text.length || availableSettings.value.style.length
)

onClickOutside(useTemplateRef('dws'), () => {
  if (!isSettingsOpened.value && !isPanelMenuOpened.value) {
    editSettings.value = null
    selectDrawing(null)
  }
})

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

const openSettings = async () => {
  if (!drawingSchema.value) {
    return
  }

  isSettingsOpened.value = true

  try {
    const p = { ikey: drawingSchema.value.ikey, schema: availableSettings.value, params: drawingSchema.value.params }
    const settings = await openModal(StudySettings, { props: p })

    if (!drawingSchema.value || !settings) {
      return
    }

    updateDrawing({
      ...drawingSchema.value.params,
      ...settings
    })
  } finally {
    isSettingsOpened.value = false
  }
}

onUnmounted(() => {
  selectDrawing(null)
  editSettings.value = null
})
</script>

<template>
  <div v-if="drawingSchema && drawingSchema.ikey !== 'emoji'">
    <div ref="dws" class="drawing-settings" :class="{ hidden: isSettingsOpened }">
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
      <template v-for="el in fastPanel" :key="el.key">
        <DrawingPropLineWidth
          v-if="el.key === 'line-width'"
          :width="Number(drawingSchema.params[el.key])"
          @update:model-value="isPanelMenuOpened = $event"
          @update="apply(el.key, $event)" />
        <DrawingPropBrushWidth
          v-else-if="el.key === 'brush-width'"
          :width="Number(drawingSchema.params[el.key])"
          @update:model-value="isPanelMenuOpened = $event"
          @update="apply(el.key, $event)" />
        <DrawingPropFontSize
          v-else-if="el.key === 'font-size'"
          :size="Number(drawingSchema.params[el.key])"
          @update:model-value="isPanelMenuOpened = $event"
          @update="apply(el.key, $event)" />
        <DrawingPropLineColor
          v-else-if="el.key === 'line-color'"
          :color="String(drawingSchema.params[el.key])"
          @update:model-value="isPanelMenuOpened = $event"
          @update="apply(el.key, $event)" />
        <DrawingPropFillColor
          v-else-if="el.key === 'fill-color'"
          :color="String(drawingSchema.params[el.key])"
          @update:model-value="isPanelMenuOpened = $event"
          @update="apply(el.key, $event)" />
        <DrawingPropTextColor
          v-else-if="el.key === 'text-color'"
          :color="String(drawingSchema.params[el.key])"
          @update:model-value="isPanelMenuOpened = $event"
          @update="apply(el.key, $event)" />
      </template>
      <div v-if="hasSettings" class="drw-btn" @click="openSettings()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28" fill="currentColor">
          <path fill-rule="evenodd" d="M18 14a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-1 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path>
          <path
            fill-rule="evenodd"
            d="M8.5 5h11l5 9-5 9h-11l-5-9 5-9Zm-3.86 9L9.1 6h9.82l4.45 8-4.45 8H9.1l-4.45-8Z"></path>
        </svg>
      </div>
      <div class="drw-btn" @click="removeDrawing()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
          <path
            fill="currentColor"
            d="M18 7h5v1h-2.01l-1.33 14.64a1.5 1.5 0 0 1-1.5 1.36H9.84a1.5 1.5 0 0 1-1.49-1.36L7.01 8H5V7h5V6c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v1Zm-6-2a1 1 0 0 0-1 1v1h6V6a1 1 0 0 0-1-1h-4ZM8.02 8l1.32 14.54a.5.5 0 0 0 .5.46h8.33a.5.5 0 0 0 .5-.46L19.99 8H8.02Z"></path>
        </svg>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'DrawingPanel.scss';
@use 'btn.scss';
</style>

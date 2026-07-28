<script setup lang="ts">
import { onClickOutside, onKeyStroke, useDraggable } from '@vueuse/core'
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import PropLineColor from '@chart/components/StudyPanel/PropLineColor.vue'
import PropFontSize from '@chart/components/StudyPanel/PropFontSize.vue'
import PropLineWidth from '@chart/components/StudyPanel/PropLineWidth.vue'
import PropLineStyle from '@chart/components/StudyPanel/PropLineStyle.vue'
import PropBrushWidth from '@chart/components/StudyPanel/PropBrushWidth.vue'
import PropFillColor from '@chart/components/StudyPanel/PropFillColor.vue'
import PropTextColor from '@chart/components/StudyPanel/PropTextColor.vue'
import { useEngineApi } from '@chart/composables/useEngine'
import { useModal } from '@chart/composables/useModal'
import StudySettings from '@chart/components/Study/StudySettings.vue'
import type { DrawingSchema } from '@engine/drawings/types'
import type { StudyParamDescriptor } from '@engine/schema'
import { STUDY_CUSTOM_SETTINGS } from '@chart/components/StudyPanel/custom-settings'

type ParamKey = keyof DrawingSchema['params']
type ParamValue = DrawingSchema['params'][ParamKey]
type MenuType = 'line' | 'color' | 'font'

const props = defineProps<{ drawingSchema: DrawingSchema }>()

const { updateDrawing, removeDrawing, selectDrawing } = useEngineApi()
const { open: openModal } = useModal()

const isSettingsOpened = ref(false)
const isPanelMenuOpened = ref(false)

const fastPanel = [
  ...props.drawingSchema.schema.style.filter((param) => param.fastPanel),
  ...props.drawingSchema.schema.text.filter((param) => param.fastPanel)
]

const availableSettings = {
  inputs: props.drawingSchema.schema.inputs.filter((p) => !p.fastPanel),
  text: props.drawingSchema.schema.text.filter((p) => !p.fastPanel),
  style: props.drawingSchema.schema.style.filter((p) => !p.fastPanel)
}

const hasSettings =
  (availableSettings.inputs.length || availableSettings.text.length || availableSettings.style.length) &&
  props.drawingSchema.ikey !== 'emoji'

const dwsRef = useTemplateRef<HTMLDivElement>('dws')
const dragHandleRef = useTemplateRef<HTMLDivElement>('dragHandle')

onClickOutside(dwsRef, () => {
  if (!isSettingsOpened.value && !isPanelMenuOpened.value) {
    editSettings.value = null
    selectDrawing(null)
  }
})

const {
  x: dragX,
  y: dragY,
  style: dragStyle
} = useDraggable(dwsRef, {
  handle: dragHandleRef,
  containerElement: () => dwsRef.value?.parentElement,
  restrictInView: true
})

onMounted(() => {
  const parent = dwsRef.value?.parentElement
  if (!parent || !dwsRef.value) {
    return
  }

  dragX.value = parent.getBoundingClientRect().width - dwsRef.value.getBoundingClientRect().width
  dragY.value = 0
})

const editSettings = ref<{ el: StudyParamDescriptor; type: MenuType } | null>(null)

const apply = (key: string, val: ParamValue) => {
  updateDrawing({
    ...props.drawingSchema.params,
    [key]: val
  })
}

const openSettings = async () => {
  isSettingsOpened.value = true

  try {
    const p = {
      ikey: props.drawingSchema.ikey,
      schema: availableSettings,
      params: props.drawingSchema.params
    }

    const modal = STUDY_CUSTOM_SETTINGS[props.drawingSchema.ikey] || StudySettings
    const settings = await openModal(modal, { props: p })

    if (!props.drawingSchema || !settings) {
      return
    }

    updateDrawing({
      ...props.drawingSchema.params,
      ...settings
    })
  } finally {
    isSettingsOpened.value = false
  }
}

const textEditorKey = computed(() => props.drawingSchema.schema.text.find((ds) => ds.textEditPanel)?.key)

const textEditorValue = computed({
  get: () => (textEditorKey.value ? props.drawingSchema.params[textEditorKey.value] : ''),
  set: (val: string) => {
    if (!textEditorKey.value) {
      return
    }

    apply(textEditorKey.value, val)
  }
})

const inputRef = ref<HTMLInputElement | null>(null)

onKeyStroke(['Backspace', 'Delete'], () => {
  removeDrawing()
})

onKeyStroke(
  ['Backspace', 'Delete'],
  (e) => {
    e.stopPropagation()
  },
  { target: inputRef }
)

onUnmounted(() => {
  selectDrawing(null)
  editSettings.value = null
})
</script>

<template>
  <div ref="dws" :style="dragStyle">
    <div class="mwc-study-panel" :class="{ hidden: isSettingsOpened }">
      <div class="mwc-drawing-settings">
        <div ref="dragHandle" class="mwc-drawing-settings-handle">
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
          <PropLineWidth
            v-if="el.type === 'line-width'"
            :width="Number(drawingSchema.params[el.key])"
            @update:model-value="isPanelMenuOpened = $event"
            @update="apply(el.key, $event)" />
          <PropLineStyle
            v-else-if="el.type === 'line-style'"
            :line-style="String(drawingSchema.params[el.key])"
            @update:model-value="isPanelMenuOpened = $event"
            @update="apply(el.key, $event)" />
          <PropLineColor
            v-else-if="el.type === 'line-color'"
            :color="String(drawingSchema.params[el.key])"
            @update:model-value="isPanelMenuOpened = $event"
            @update="apply(el.key, $event)" />
          <PropBrushWidth
            v-else-if="el.key === 'brush-width'"
            :width="Number(drawingSchema.params[el.key])"
            @update:model-value="isPanelMenuOpened = $event"
            @update="apply(el.key, $event)" />
          <PropFontSize
            v-else-if="el.key === 'font-size'"
            :size="Number(drawingSchema.params[el.key])"
            @update:model-value="isPanelMenuOpened = $event"
            @update="apply(el.key, $event)" />

          <PropFillColor
            v-else-if="el.key === 'fill-color'"
            :color="String(drawingSchema.params[el.key])"
            @update:model-value="isPanelMenuOpened = $event"
            @update="apply(el.key, $event)" />
          <PropTextColor
            v-else-if="el.key === 'text-color'"
            :color="String(drawingSchema.params[el.key])"
            @update:model-value="isPanelMenuOpened = $event"
            @update="apply(el.key, $event)" />
        </template>
        <div v-if="hasSettings" class="mwc-drw-btn" @click="openSettings()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28" fill="currentColor">
            <path fill-rule="evenodd" d="M18 14a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-1 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path>
            <path
              fill-rule="evenodd"
              d="M8.5 5h11l5 9-5 9h-11l-5-9 5-9Zm-3.86 9L9.1 6h9.82l4.45 8-4.45 8H9.1l-4.45-8Z"></path>
          </svg>
        </div>
        <div class="mwc-drw-btn" @click="removeDrawing()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
            <path
              fill="currentColor"
              d="M18 7h5v1h-2.01l-1.33 14.64a1.5 1.5 0 0 1-1.5 1.36H9.84a1.5 1.5 0 0 1-1.49-1.36L7.01 8H5V7h5V6c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v1Zm-6-2a1 1 0 0 0-1 1v1h6V6a1 1 0 0 0-1-1h-4ZM8.02 8l1.32 14.54a.5.5 0 0 0 .5.46h8.33a.5.5 0 0 0 .5-.46L19.99 8H8.02Z"></path>
          </svg>
        </div>
      </div>
      <div v-if="textEditorKey" class="mwc-study-text-editor">
        <input ref="inputRef" v-model="textEditorValue" type="text" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'StudyPanelControls.scss';
@use 'btn.scss';
</style>

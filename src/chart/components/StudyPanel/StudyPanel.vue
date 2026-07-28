<script lang="ts" setup>
import { useDraggable } from '@vueuse/core'
import { nextTick, ref, useTemplateRef, watch } from 'vue'
import StudyPanelControls from '@chart/components/StudyPanel/StudyPanelControls.vue'
import { useEngineApi } from '@chart/composables/useEngine'

const { drawingSchema } = useEngineApi()

const panelRef = useTemplateRef('panel')

const { x, y, style } = useDraggable(panelRef, {
  containerElement: () => panelRef.value?.parentElement,
  restrictInView: true
})

const isPositioned = ref(false)

watch(
  () => !!drawingSchema.value,
  async (hasSchema) => {
    if (!hasSchema || isPositioned.value) {
      return
    }

    await nextTick()

    if (!panelRef.value) {
      return
    }

    const parent = panelRef.value.parentElement

    if (!parent) {
      return
    }

    x.value = parent.getBoundingClientRect().width - panelRef.value.getBoundingClientRect().width
    y.value = 0

    isPositioned.value = true
  },
  { immediate: true }
)
</script>

<template>
  <div ref="panel" class="study-panel-controls" :style="style">
    <StudyPanelControls v-if="drawingSchema" :drawing-schema="drawingSchema" />
  </div>
</template>

<style lang="scss" scoped>
@use 'StudyPanel.scss';
</style>

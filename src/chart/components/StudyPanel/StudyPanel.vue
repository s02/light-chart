<script lang="ts" setup>
import StudyPanelControls from '@chart/components/StudyPanel/StudyPanelControls.vue'
import { useEngineApi } from '@chart/composables/useEngine'

const { drawingSchema } = useEngineApi()
</script>

<template>
  <StudyPanelControls v-if="drawingSchema" class="study-panel-controls" :drawing-schema="drawingSchema" />
</template>

<style lang="scss" scoped>
@use 'StudyPanel.scss';
</style>

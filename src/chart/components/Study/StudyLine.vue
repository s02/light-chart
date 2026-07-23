<script setup lang="ts">
import FloatingDropdown from '@chart/components/FloatingDropdown.vue'
import LineStyleIcon from '@chart/components/LineStyleIcon.vue'
import LineTypeIcon from '@chart/components/LineTypeIcon.vue'
import ColorPicker from '@chart/components/Pickers/ColorPicker.vue'
import type { LineParamValue } from '@engine/schema'
import { ref } from 'vue'

const isOpened = ref(false)

const line = defineModel<LineParamValue>({
  default: {
    color: 'rgb(33 150 243)',
    width: 3,
    style: 0,
    type: 0
  }
})

const setWidth = (width: LineParamValue['lineWidth']) => {
  line.value.lineWidth = width
}

const setStyle = (style: LineParamValue['lineStyle']) => {
  line.value.lineStyle = style
}

const setType = (type: LineParamValue['lineType']) => {
  line.value.lineType = type
}

const setColor = (color: string) => {
  line.value.color = color
}
</script>

<template>
  <FloatingDropdown :open="isOpened" @update:open="isOpened = false">
    <template #trigger="{ triggerRef }">
      <button :ref="triggerRef" class="mwc-study-line-btn" @click="isOpened = true">
        <span class="mwc-study-line-color" :style="{ backgroundColor: line.color }"></span>
        <LineStyleIcon :line-width="line.lineWidth" :line-style="line.lineStyle" :style="{ color: line.color }" />
      </button>
    </template>
    <div class="mwc-line-picker">
      <ColorPicker :color="line.color" @select="setColor" />

      <div class="mwc-line-picker-container">
        <div class="mwc-line-picker-buttons mwc-line-picker-width-buttons">
          <div
            v-for="i in [1, 2, 3, 4]"
            :key="i"
            class="mwc-line-btn"
            :class="{ active: line.lineWidth === i }"
            @click="setWidth(i)">
            <span :style="{ height: `${i}px` }"></span>
          </div>
        </div>
        <div class="mwc-line-picker-buttons mwc-line-picker-style-buttons">
          <div
            v-for="i in [0, 1, 2, 3, 4]"
            :key="i"
            class="mwc-line-btn"
            :class="{ active: line.lineStyle === i }"
            @click="setStyle(i)">
            <LineStyleIcon :line-width="2" :line-style="i" />
          </div>
        </div>

        <div class="mwc-line-picker-buttons mwc-line-picker-type-buttons">
          <div
            v-for="i in [0, 1, 2]"
            :key="i"
            class="mwc-line-btn"
            :class="{ active: line.lineType === i }"
            @click="setType(i)">
            <LineTypeIcon :line-type="i" />
          </div>
        </div>
      </div>
    </div>
  </FloatingDropdown>
</template>

<style lang="scss" scoped>
@use 'StudyLine.scss';
</style>

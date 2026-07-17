<script setup lang="ts">
import { i18n } from '@chart/i18n'
import CloseIcon from '@chart/components/CloseIcon.vue'
import type { StudyParams, StudySchema } from '@engine/schema'
import { ref } from 'vue'
import CButton from '@chart/components/Controls/CButton.vue'
import CCheckbox from '@chart/components/Controls/CCheckbox.vue'
import StudyColor from './StudyColor.vue'
import type { GannSquareParams } from '@engine/drawings/GannSquare/GannSquare.ts'
import StudyFontSize from '@chart/components/Study/StudyFontSize.vue'

const emit = defineEmits<{
  (e: 'close', result?: StudyParams): void
}>()

const props = defineProps<{ schema: StudySchema; params: GannSquareParams; ikey: string }>()
const params = ref<GannSquareParams>({ ...props.params })

const apply = () => {
  emit('close', params.value)
}
</script>

<template>
  <div class="mwc-studysett mwc-gs">
    <div class="mwc-studysett-container">
      <div class="mwc-studysett-header">
        <p class="mwc-studysett-title">{{ i18n.translate(`study-${ikey}`) }}</p>
        <button class="mwc-studysett-close" @click="emit('close')"><CloseIcon /></button>
      </div>
      <div class="mwc-studysett-header-border"></div>
    </div>

    <div class="mwc-studysett-body ch-scroll">
      <div class="mwc-studysett-container">
        <div class="mwc-studysett-section">
          <div class="mwc-studysett-section-name">Levels</div>
          <div class="mwc-gs-section">
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['square-0-visible']" />0</label>
              <StudyColor v-model="params['square-0-color']" :disabled="!params['square-0-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['square-1-visible']" />1</label>
              <StudyColor v-model="params['square-1-color']" :disabled="!params['square-1-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['square-2-visible']" />2</label>
              <StudyColor v-model="params['square-2-color']" :disabled="!params['square-2-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['square-3-visible']" />3</label>
              <StudyColor v-model="params['square-3-color']" :disabled="!params['square-3-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['square-4-visible']" />4</label>
              <StudyColor v-model="params['square-4-color']" :disabled="!params['square-4-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['square-5-visible']" />5</label>
              <StudyColor v-model="params['square-5-color']" :disabled="!params['square-5-visible']" />
            </div>
          </div>
        </div>
        <div class="mwc-studysett-section">
          <div class="mwc-studysett-section-name">Fans</div>
          <div class="mwc-gs-section">
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['fan-8x1-visible']" />8x1</label>
              <StudyColor v-model="params['fan-8x1-color']" :disabled="!params['fan-8x1-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['fan-5x1-visible']" />5x1</label>
              <StudyColor v-model="params['fan-5x1-color']" :disabled="!params['fan-5x1-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['fan-4x1-visible']" />4x1</label>
              <StudyColor v-model="params['fan-4x1-color']" :disabled="!params['fan-4x1-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['fan-3x1-visible']" />3x1</label>
              <StudyColor v-model="params['fan-3x1-color']" :disabled="!params['fan-3x1-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['fan-2x1-visible']" />2x1</label>
              <StudyColor v-model="params['fan-2x1-color']" :disabled="!params['fan-2x1-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['fan-1x1-visible']" />1x1</label>
              <StudyColor v-model="params['fan-1x1-color']" :disabled="!params['fan-1x1-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['fan-1x2-visible']" />1x2</label>
              <StudyColor v-model="params['fan-1x2-color']" :disabled="!params['fan-1x2-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['fan-1x3-visible']" />1x3</label>
              <StudyColor v-model="params['fan-1x3-color']" :disabled="!params['fan-1x3-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['fan-1x4-visible']" />1x4</label>
              <StudyColor v-model="params['fan-1x4-color']" :disabled="!params['fan-1x4-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['fan-1x5-visible']" />1x5</label>
              <StudyColor v-model="params['fan-1x5-color']" :disabled="!params['fan-1x5-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['fan-1x6-visible']" />1x6</label>
              <StudyColor v-model="params['fan-1x6-color']" :disabled="!params['fan-1x6-visible']" />
            </div>
          </div>
        </div>
        <div class="mwc-studysett-section">
          <div class="mwc-studysett-section-name">Arcs</div>
          <div class="mwc-gs-section">
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['arc-1x0-visible']" />1x0</label>
              <StudyColor v-model="params['arc-1x0-color']" :disabled="!params['arc-1x0-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['arc-1x1-visible']" />1x1</label>
              <StudyColor v-model="params['arc-1x1-color']" :disabled="!params['arc-1x1-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['arc-1.5x0-visible']" />1.5x0</label>
              <StudyColor v-model="params['arc-1.5x0-color']" :disabled="!params['arc-1.5x0-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['arc-2x0-visible']" />2x0</label>
              <StudyColor v-model="params['arc-2x0-color']" :disabled="!params['arc-2x0-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['arc-2x1-visible']" />2x1</label>
              <StudyColor v-model="params['arc-2x1-color']" :disabled="!params['arc-2x1-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['arc-3x0-visible']" />3x0</label>
              <StudyColor v-model="params['arc-3x0-color']" :disabled="!params['arc-3x0-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['arc-3x1-visible']" />3x1</label>
              <StudyColor v-model="params['arc-3x1-color']" :disabled="!params['arc-3x1-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['arc-4x0-visible']" />4x0</label>
              <StudyColor v-model="params['arc-4x0-color']" :disabled="!params['arc-4x0-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['arc-4x1-visible']" />4x1</label>
              <StudyColor v-model="params['arc-4x1-color']" :disabled="!params['arc-4x1-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['arc-5x0-visible']" />5x0</label>
              <StudyColor v-model="params['arc-5x0-color']" :disabled="!params['arc-5x0-visible']" />
            </div>
            <div class="mwc-gs-row">
              <label class="mwc-studysett-label"><CCheckbox v-model="params['arc-5x1-visible']" />5x1</label>
              <StudyColor v-model="params['arc-5x1-color']" :disabled="!params['arc-5x1-visible']" />
            </div>
          </div>
        </div>

        <div class="mwc-gs-font">
          <label class="mwc-studysett-label"><CCheckbox v-model="params['labels-visible']" />Ranges and ratio</label>
          <StudyColor v-model="params['font-color']" :disabled="!params['labels-visible']" />
          <StudyFontSize v-model="params['font-size']" :disabled="!params['labels-visible']" />
        </div>
      </div>
    </div>

    <div class="mwc-studysett-footer mwc-studysett-container">
      <CButton type="primary" @click="apply()">{{ i18n.translate('modal-study-apply') }}</CButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'StudySettings.scss';
@use 'StudyGannSquare.scss';
</style>

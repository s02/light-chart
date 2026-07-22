<script setup lang="ts">
import { i18n } from '@chart/i18n'
import StudyColor from './StudyColor.vue'
import StudyLineWidth from './StudyLineWidth.vue'
import StudyLineStyle from './StudyLineStyle.vue'
import StudyFontSize from './StudyFontSize.vue'
import CInput from '@chart/components/Controls/CInput.vue'
import CCheckbox from '@chart/components/Controls/CCheckbox.vue'
import CSelect from '@chart/components/Controls/CSelect.vue'
import StudyLine from '@chart/components/Study/StudyLine.vue'
import type { LineParamValue, StudyParams } from '@engine/schema'
import type { StudyLeafParam } from './StudySettings.vue'

defineProps<{ el: StudyLeafParam; params: StudyParams }>()
</script>

<template>
  <label class="mwc-studysett-label">{{ i18n.translate(`study-prop-${el.key}`) }}</label>
  <!-- prettier-ignore -->
  <StudyColor v-if="el.type === 'color' || el.type === 'line-color'" v-model="(params[el.key] as string)" />
  <!-- prettier-ignore -->
  <StudyLineWidth v-else-if="el.type === 'line-width'" v-model="(params[el.key] as number)" />
  <!-- prettier-ignore -->
  <StudyLineStyle v-else-if="el.type === 'line-style'" v-model="(params[el.key] as string)" />
  <!-- prettier-ignore -->
  <StudyFontSize v-else-if="el.type === 'font-size'" v-model="(params[el.key] as number)" />
  <!-- prettier-ignore -->
  <CInput
    v-if="el.type === 'number'"
    v-model="(params[el.key] as number)"
    type="number"
    :min="el.min"
    :max="el.max"
    :step="el.step || 1"
    class="mwc-studysett-input" />
  <!-- prettier-ignore -->
  <CCheckbox v-else-if="el.type === 'bool'" v-model="(params[el.key] as boolean)" />
  <!-- prettier-ignore -->
  <CSelect
    v-else-if="el.type === 'select' && el.values"
    v-model:current="(params[el.key] as string)"
    :values="el.values" />
  <!-- prettier-ignore -->
  <StudyLine v-else-if="el.type === 'line'" v-model="(params[el.key] as LineParamValue)" />
</template>

<style lang="scss" scoped>
@use 'StudySettings.scss';
</style>

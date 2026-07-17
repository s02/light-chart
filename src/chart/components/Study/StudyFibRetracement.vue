<script setup lang="ts">
import { i18n } from '@chart/i18n'
import { ref } from 'vue'
import CButton from '@chart/components/Controls/CButton.vue'
import CInput from '@chart/components/Controls/CInput.vue'
import CloseIcon from '@chart/components/CloseIcon.vue'
import StudyColor from './StudyColor.vue'
import CCheckbox from '@chart/components/Controls/CCheckbox.vue'
import type { StudyParams, StudySchema } from '@engine/schema'
import type { FibRetracementParams } from '@engine/drawings/FibRetracement/FibRetracement.ts'

const emit = defineEmits<{
  (e: 'close', result?: StudyParams): void
}>()

const props = defineProps<{ schema: StudySchema; params: FibRetracementParams; ikey: string }>()
const params = ref<FibRetracementParams>({ ...props.params })

const levels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

const apply = () => {
  emit('close', params.value)
}
</script>

<template>
  <div class="mwc-studysett mwc-fr">
    <div class="mwc-studysett-container">
      <div class="mwc-studysett-header">
        <p class="mwc-studysett-title">{{ i18n.translate(`study-${ikey}`) }}</p>
        <button class="mwc-studysett-close" @click="emit('close')"><CloseIcon /></button>
      </div>
      <div class="mwc-studysett-header-border"></div>
    </div>

    <div class="mwc-studysett-body ch-scroll">
      <div class="mwc-studysett-container">
        <div class="mwc-fr-section">
          <div v-for="level in levels" :key="level" class="mwc-fr-el">
            <CCheckbox v-model="params[`fr-c${level}-visible`]" />
            <CInput v-model="params[`fr-c${level}-ratio`]" type="number" :disabled="!params[`fr-c${level}-visible`]" />
            <StudyColor v-model="params[`fr-c${level}-color`]" :disabled="!params[`fr-c${level}-visible`]" />
          </div>
        </div>
        .mwc-
      </div>
    </div>

    <div class="mwc-studysett-footer mwc-studysett-container">
      <CButton type="primary" @click="apply()">{{ i18n.translate('modal-study-apply') }}</CButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'StudySettings.scss';
@use 'StudyFibRetracement.scss';
</style>

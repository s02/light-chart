<script setup lang="ts">
import { i18n } from '@chart/i18n'
import type { StudyParams, StudySchema } from '@engine/schema'
import { ref } from 'vue'
import CButton from '@chart/components/Controls/CButton.vue'
import CInput from '@chart/components/Controls/CInput.vue'
import CloseIcon from '@chart/components/CloseIcon.vue'
import StudyColor from './StudyColor.vue'
import StudyFontSize from './StudyFontSize.vue'

const emit = defineEmits<{
  (e: 'close', result?: StudyParams): void
}>()

const props = defineProps<{ schema: StudySchema; params: StudyParams; ikey: string }>()
const params = ref<StudyParams>({ ...props.params })

const c = props.schema.style.filter((s) => s.key.indexOf('fr-c') === 0)
const items = props.schema.style.filter((s) => s.key.indexOf('fr-c') !== 0)

const levels = []
for (let i = 0; i < c.length; i = i + 2) {
  if (props.schema.style[i].key.indexOf('fr-c') === 0) {
    levels.push({
      level: i,
      ratio: props.schema.style[i],
      color: props.schema.style[i + 1]
    })
  }
}

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
        <div class="mwc-studysett-group">
          <template v-for="el in items" :key="el.key">
            <label>{{ i18n.translate(`study-prop-${el.key}`) }}</label>
            <StudyColor
              v-if="el.type === 'color' || el.type === 'line-color'"
              :color="String(params[el.key])"
              @update="params[el.key] = $event" />
            <StudyFontSize
              v-else-if="el.type === 'font-size'"
              :size="Number(params[el.key])"
              @update="params[el.key] = $event" />
          </template>
        </div>

        <div class="mwc-studysett-group">
          <template v-for="el in levels" :key="el.level">
            <div class="mwc-fr-el">
              <CInput v-model="params[el.ratio.key]" type="number" class="mwc-studysett-input" />
              <StudyColor :color="String(params[el.color.key])" @update="params[el.color.key] = $event" />
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="mwc-studysett-footer mwc-studysett-container">
      <CButton type="primary" @click="apply()">Apply</CButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'StudySettings.scss';
@use 'StudyFibRetracement.scss';
</style>

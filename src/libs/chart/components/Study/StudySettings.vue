<script setup lang="ts">
import { i18n } from '@chart/i18n'
import CloseIcon from '@chart/components/CloseIcon.vue'
import ChartTabs from '@chart/components/ChartTabs.vue'
import { ref } from 'vue'
import type { StudyParams, StudySchema } from '@engine/schema'
import StudyColor from './StudyColor.vue'
import StudyLineWidth from './StudyLineWidth.vue'
import StudyFontSize from './StudyFontSize.vue'
import StudyInput from '@chart/components/Study/StudyInput.vue'
import StudyCheckbox from '@chart/components/Study/StudyCheckbox.vue'

const emit = defineEmits<{
  (e: 'close', result?: StudyParams): void
}>()

const props = defineProps<{ schema: StudySchema; params: StudyParams; ikey: string }>()
const params = ref<StudyParams>({ ...props.params })

const apply = () => {
  emit('close', params.value)
}

const initTabs = () => {
  const result: string[] = []

  if (props.schema.inputs.length) {
    result.push('tab-inputs')
  }

  if (props.schema.style.length) {
    result.push('tab-style')
  }

  if (props.schema.text.length) {
    result.push('tab-text')
  }

  return result
}

const tabs = initTabs()
const tab = ref(tabs[0])
</script>

<template>
  <div class="studysett">
    <div class="studysett-container">
      <div class="studysett-header">
        <p class="studysett-title">{{ i18n.translate(`study-${ikey}`) }}</p>
        <button class="studysett-close" @click="emit('close')"><CloseIcon /></button>
      </div>
      <ChartTabs v-if="tabs && tab" :active="tab" :tabs="tabs.map((key) => ({ key }))" @selected="tab = $event" />
    </div>

    <div class="studysett-body ch-scroll">
      <div class="studysett-container">
        <template v-if="tab === 'tab-text'">
          <div class="studysett-row">
            <div v-if="schema.text?.find((ps) => ps.key === 'text-color')" class="studysett-ctrl-color">
              <StudyColor :color="String(params['text-color'])" @update="params['text-color'] = $event" />
            </div>
            <div v-if="schema.text?.find((ps) => ps.key === 'font-size')" class="studysett-ctrl-font">
              <StudyFontSize :size="Number(params['font-size'])" @update="params['font-size'] = $event" />
            </div>
          </div>
          <div v-if="schema.text?.find((ps) => ps.key === 'text')" class="studysett-ctrl-text">
            <textarea v-model="params['text'] as string"></textarea>
          </div>
        </template>
        <template v-else-if="tab === 'tab-style'">
          <div class="studysett-group">
            <template v-for="el in schema.style" :key="el.key">
              <label>{{ i18n.translate(`study-prop-${el.key}`) }}</label>
              <StudyColor
                v-if="el.type === 'color'"
                :color="String(params[el.key])"
                @update="params[el.key] = $event" />
              <StudyLineWidth
                v-else-if="el.type === 'line-width'"
                :width="Number(params[el.key])"
                @update="params[el.key] = $event" />
              <StudyFontSize
                v-else-if="el.type === 'font-size'"
                :size="Number(params[el.key])"
                @update="params[el.key] = $event" />
              <StudyInput
                v-if="el.type === 'number'"
                v-model="params[el.key]"
                type="number"
                :min="el.min"
                :max="el.max"
                :step="el.step || 1"
                class="studysett-input" />
            </template>
          </div>
        </template>
        <template v-else-if="tab === 'tab-inputs'">
          <div class="studysett-group">
            <template v-for="el in schema.inputs" :key="el.key">
              <label>{{ i18n.translate(`study-prop-${el.key}`) }}</label>
              <StudyInput
                v-if="el.type === 'number'"
                v-model="params[el.key]"
                type="number"
                :min="el.min"
                :max="el.max"
                :step="el.step || 1"
                class="studysett-input" />
              <StudyCheckbox v-else-if="el.type === 'bool'" v-model="params[el.key]" />
            </template>
          </div>
        </template>
      </div>
    </div>

    <div class="studysett-footer studysett-container">
      <button class="studysett-btn" @click="apply()">Apply</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'StudySettings.scss';
</style>

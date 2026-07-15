<script setup lang="ts">
import { i18n } from '@chart/i18n'
import CloseIcon from '@chart/components/CloseIcon.vue'
import ChartTabs from '@chart/components/ChartTabs.vue'
import { ref } from 'vue'
import type { SchemaKey, StudyParams, StudySchema } from '@engine/schema'
import StudyColor from './StudyColor.vue'
import StudyLineWidth from './StudyLineWidth.vue'
import StudyFontSize from './StudyFontSize.vue'
import CInput from '@chart/components/Controls/CInput.vue'
import CCheckbox from '@chart/components/Controls/CCheckbox.vue'
import CSelect from '@chart/components/Controls/CSelect.vue'
import CButton from '@chart/components/Controls/CButton.vue'

const emit = defineEmits<{
  (e: 'close', result?: StudyParams): void
}>()

const props = defineProps<{ schema: StudySchema; params: StudyParams; ikey: string }>()
const params = ref<StudyParams>({ ...props.params })

const apply = () => {
  emit('close', params.value)
}

const initTabs = () => {
  const result: (keyof StudySchema)[] = []
  const keys = Object.keys(props.schema) as SchemaKey[]
  keys.forEach((key) => {
    if (props.schema[key].length) {
      result.push(key)
    }
  })

  return result
}

const tabs = initTabs()
const tab = ref(tabs[0])
const setTab = (v: string) => {
  tab.value = v.replace('tab-', '') as SchemaKey
}
</script>

<template>
  <div class="mwc-studysett">
    <div class="mwc-studysett-container">
      <div class="mwc-studysett-header">
        <p class="mwc-studysett-title">{{ i18n.translate(`study-${ikey}`) }}</p>
        <button class="mwc-studysett-close" @click="emit('close')"><CloseIcon /></button>
      </div>
      <ChartTabs
        v-if="tabs && tab"
        :active="`tab-${tab}`"
        :tabs="tabs.map((key) => ({ key: `tab-${key}` }))"
        @selected="setTab" />
    </div>

    <div class="mwc-studysett-body ch-scroll">
      <div class="mwc-studysett-container">
        <template v-if="tab === 'text'">
          <div class="mwc-studysett-row">
            <div v-if="schema.text?.find((ps) => ps.key === 'text-color')" class="mwc-studysett-ctrl-color">
              <StudyColor :color="String(params['text-color'])" @update="params['text-color'] = $event" />
            </div>
            <div v-if="schema.text?.find((ps) => ps.key === 'font-size')" class="mwc-studysett-ctrl-font">
              <StudyFontSize :size="Number(params['font-size'])" @update="params['font-size'] = $event" />
            </div>
          </div>
          <div v-if="schema.text?.find((ps) => ps.key === 'text')" class="mwc-studysett-ctrl-text">
            <textarea
              :value="String(params['text'])"
              @input="params['text'] = ($event.target as HTMLTextAreaElement).value"></textarea>
          </div>
        </template>
        <template v-else>
          <div class="mwc-studysett-group">
            <template v-for="el in schema[tab]" :key="el.key">
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
              <CInput
                v-if="el.type === 'number'"
                v-model="params[el.key]"
                type="number"
                :min="el.min"
                :max="el.max"
                :step="el.step || 1"
                class="mwc-studysett-input" />
              <CCheckbox v-else-if="el.type === 'bool'" v-model="params[el.key]" />
              <CSelect
                v-else-if="el.type === 'select' && el.values"
                v-model:current="params[el.key]"
                :values="el.values" />
            </template>
          </div>
        </template>
      </div>
    </div>

    <div class="mwc-studysett-footer mwc-studysett-container">
      <CButton type="primary" @click="apply()">Apply</CButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'StudySettings.scss';
</style>

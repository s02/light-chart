<script setup lang="ts">
import { i18n } from '@chart/i18n'
import CloseIcon from '@chart/components/CloseIcon.vue'
import ChartTabs from '@chart/components/ChartTabs.vue'
import { ref } from 'vue'
import type { StudyParams, StudySchema } from '@engine/schema'

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
          <div class="stydysett-group">
            <div v-if="props.schema.text?.find((ps) => ps.key === 'text-color')" class="studysett-ctrl-color">
              color
            </div>
            <div v-if="props.schema.text?.find((ps) => ps.key === 'font-size')" class="studysett-ctrl-font">
              font-size
            </div>
          </div>
          <div v-if="props.schema.text?.find((ps) => ps.key === 'text')" class="studysett-ctrl-text">
            <textarea v-model="params['text']"></textarea>
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

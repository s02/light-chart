<script setup lang="ts">
import CloseIcon from '@chart/components/CloseIcon.vue'
import { i18n } from '@chart/i18n'
import { ref } from 'vue'
import type { StudyParams, StudySchema } from '@engine/schema'

const emit = defineEmits<{
  (e: 'close', result?: StudyParams): void
}>()

const props = defineProps<{ schema: StudySchema; params: StudyParams; ikey: string }>()

const params = ref<StudyParams>(props.params)

const apply = () => {
  emit('close', params.value)
}
</script>

<template>
  <div class="ind-settings">
    <div class="ind-settings-header">
      <p class="ind-settings-title">{{ i18n.translate(`indicator-${ikey}`) }}</p>
      <button class="ind-settings-close" @click="emit('close')"><CloseIcon /></button>
    </div>
    <div class="ind-settings-body ch-scroll">
      <div class="ind-settings-group">
        <div v-for="el in schema.inputs" :key="el.key">
          <label for="">{{ el.key }}</label>
          <div v-if="el.type === 'number'"><input v-model="params[el.key]" type="number" /></div>
        </div>

        <div v-for="el in schema.style" :key="el.key">
          <label for="">{{ el.key }}</label>
          <div v-if="el.type === 'color'"><input v-model="params[el.key]" type="text" /></div>
        </div>
      </div>

      <button @click="apply()">apply</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'ModalIndicatorSettings.scss';
</style>

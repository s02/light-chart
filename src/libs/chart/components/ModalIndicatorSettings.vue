<script setup lang="ts">
import CloseIcon from '@chart/components/CloseIcon.vue'
import { i18n } from '@chart/i18n'
import { ref, shallowRef } from 'vue'
import ChartTabs from '@chart/components/ChartTabs.vue'
import ChartMenu from '@chart/components/ChartMenu.vue'
import ColorPicker from '@chart/components/ColorPicker.vue'
import type { StudyParams, StudySchema } from '@engine/schema'
import { provideChartMenu } from '@chart/useChartMenu'

const emit = defineEmits<{
  (e: 'close', result?: StudyParams): void
}>()

const props = defineProps<{ schema: StudySchema; params: StudyParams; ikey: string }>()
const tab = ref<string>('tab-inputs')
const btnColorMenu = shallowRef<HTMLElement | null>(null)
const currentKey = ref<string | null>(null)
const { close: closeMenuColor, open: openMenuColor, key: colorMenuKey } = provideChartMenu('color-menu', btnColorMenu)

const params = ref<StudyParams>({ ...props.params })

const apply = () => {
  emit('close', params.value)
}

const setColor = (color: string) => {
  if (!currentKey.value) {
    return
  }

  params.value[currentKey.value] = color
  btnColorMenu.value = null
  currentKey.value = null
  closeMenuColor()
}

const openColorMenu = (target: HTMLElement, key: string) => {
  btnColorMenu.value = target
  currentKey.value = key
  openMenuColor()
}
</script>

<template>
  <div class="ind-settings">
    <div class="ind-settings-container">
      <div class="ind-settings-header">
        <p class="ind-settings-title">{{ i18n.translate(`indicator-${ikey}`) }}</p>
        <button class="ind-settings-close" @click="emit('close')"><CloseIcon /></button>
      </div>
      <ChartTabs
        :active="tab"
        :tabs="[{ key: 'tab-inputs' }, { key: 'tab-style' }]"
        @selected="($event) => (tab = $event)" />
    </div>

    <div class="ind-settings-body ch-scroll">
      <div class="ind-settings-group ind-settings-container">
        <template v-if="tab === 'tab-inputs'">
          <template v-for="el in schema.inputs" :key="el.key">
            <label>{{ i18n.translate(`ind-prop-${el.key}`) }}</label>
            <input
              v-if="el.type === 'number'"
              v-model="params[el.key]"
              type="number"
              :min="el.min"
              :max="el.max"
              :step="el.step || 1" />
          </template>
        </template>

        <template v-if="tab === 'tab-style'">
          <template v-for="el in schema.style" :key="el.key">
            <label>{{ i18n.translate(`ind-prop-${el.key}`) }}</label>
            <div v-if="el.type === 'color'">
              <input
                v-model="params[el.key]"
                type="text"
                @click="openColorMenu($event.currentTarget as HTMLElement, el.key)" />
            </div>
          </template>
          <ChartMenu :menu-key="colorMenuKey" placement="bottom-start">
            <ColorPicker ref="colorPicker" @select="setColor" />
          </ChartMenu>
        </template>
      </div>
      <div class="ind-settings-footer ind-settings-container">
        <button @click="apply()">apply</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'ModalIndicatorSettings.scss';
</style>

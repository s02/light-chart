<script setup lang="ts">
import CloseIcon from '@chart/components/CloseIcon.vue'
import { i18n } from '@chart/i18n'
import { INDICATOR_SCRIPTS } from '@engine/indicators'
import type { IndicatorScript } from '@engine/types'

const emit = defineEmits<{
  (e: 'close', result?: IndicatorScript): void
}>()
</script>

<template>
  <div class="ind-list">
    <div class="ind-list-header">
      <p class="ind-list-title">Indicators</p>
      <button class="ind-list-close" @click="emit('close')"><CloseIcon /></button>
    </div>
    <div class="ind-list-body ch-scroll">
      <div class="ind-list-group">Script Name</div>
      <div
        v-for="script in INDICATOR_SCRIPTS"
        :key="script.key"
        class="ind-list-item"
        @click="emit('close', script.key)">
        {{ i18n.translate(`indicator-${script.key}`) }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'ModalIndicatorsList.scss';
</style>

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
  <div class="mwc-ind-list">
    <div class="mwc-ind-list-header">
      <p class="mwc-ind-list-title">Indicators</p>
      <button class="mwc-ind-list-close" @click="emit('close')"><CloseIcon /></button>
    </div>
    <div class="mwc-ind-list-body ch-scroll">
      <div class="mwc-ind-list-group">Script Name</div>
      <div
        v-for="script in INDICATOR_SCRIPTS"
        :key="script.indicator.ikey"
        class="mwc-ind-list-item"
        @click="emit('close', script)">
        {{ i18n.translate(`study-${script.indicator.ikey}`) }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'ModalIndicatorsList.scss';
</style>

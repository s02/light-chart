<script setup lang="ts">
import CloseIcon from '@chart/components/CloseIcon.vue'
import { i18n } from '@chart/i18n'
import { INDICATOR_SCRIPTS } from '@engine/indicators'
import type { IndicatorScript } from '@engine/types'
import { computed, onMounted, ref } from 'vue'

const emit = defineEmits<{
  (e: 'close', result?: IndicatorScript): void
}>()

const searchInputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  searchInputRef.value?.focus()
})

INDICATOR_SCRIPTS.sort((i1, i2) => {
  const name1 = i18n.translate(`study-${i1.indicator.ikey}`).value
  const name2 = i18n.translate(`study-${i2.indicator.ikey}`).value

  return name1.localeCompare(name2)
})

const searchInput = ref<string | null>(null)

const list = computed(() => {
  if (!searchInput.value?.trim()) {
    return INDICATOR_SCRIPTS
  }

  const words = searchInput.value.toLowerCase().trim().split(/\s+/)

  return INDICATOR_SCRIPTS.filter((script) => words.every((word) => script.keywords.includes(word)))
})
</script>

<template>
  <div class="mwc-ind-list">
    <div class="mwc-ind-list-header">
      <p class="mwc-ind-list-title">Indicators</p>
      <button class="mwc-ind-list-close" @click="emit('close')"><CloseIcon /></button>
    </div>

    <div class="mwc-ind-list-search">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28" fill="none">
        <path stroke="currentColor" d="M17.4 17.5a7 7 0 1 0-4.9 2c1.9 0 3.64-.76 4.9-2zm0 0l5.1 5"></path>
      </svg>
      <input ref="searchInputRef" v-model="searchInput" type="text" />
    </div>
    <div class="mwc-ind-list-body ch-scroll">
      <div class="mwc-ind-list-group">Script Name</div>
      <div v-for="script in list" :key="script.indicator.ikey" class="mwc-ind-list-item" @click="emit('close', script)">
        {{ i18n.translate(`study-${script.indicator.ikey}`) }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'ModalIndicatorsList.scss';
</style>

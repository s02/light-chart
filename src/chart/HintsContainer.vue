<script setup lang="ts">
import { useHints } from '@chart/composables/useHints'
import { i18n } from '@chart/i18n'

const { current } = useHints()
</script>

<template>
  <div v-if="current" class="mwc-hints-container">
    <div class="mwc-hint">{{ i18n.translate(current) }}</div>
  </div>
</template>

<style lang="scss" scoped>
@use 'HintsContainer.scss';
</style>

<script lang="ts" setup>
import { PROFITABILITY } from '../constants'
import type { ProfitabilityType } from '../types'

defineProps<{ name: string; active: boolean; profitability: ProfitabilityType }>()
</script>

<template>
  <div class="asset" :class="{ active }">
    <div class="asset-body">
      <div class="asset-header">
        <div class="asset-name">{{ name }}</div>
      </div>
      <div class="asset-footer">
        <div class="asset-type">{{ profitability === PROFITABILITY.TURBO ? '1—5 min' : '5+ min' }}</div>
        <div class="asset-profit">95%</div>
      </div>
    </div>
    <div class="asset-button"><span class="asset-arrow"></span></div>
  </div>
</template>

<style lang="scss" scoped>
@use 'AssetButton.scss';
</style>

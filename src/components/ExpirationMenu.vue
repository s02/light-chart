<script setup lang="ts">
import type { Expiration } from '../transport/types'
import { useChart } from '../useChart'
import { useExpirations } from '../useExpirations'

const { format: formatExp } = useExpirations()
const { chartState, setExpiration } = useChart()

const compare = (exp1: Expiration, exp2: Expiration) => {
  return exp1.type === exp2.type && exp1.close === exp2.close && exp1.lock === exp2.lock
}

const step = (v: number) => {
  const currentExpiration = chartState.value.currentExpiration
  const expirations = chartState.value.expirations
  if (!currentExpiration) {
    return
  }
  const ind = expirations.findIndex((exp) => compare(exp, currentExpiration.expiration))
  if (ind + v < 0 || ind + v >= expirations.length) {
    return
  }

  setExpiration(expirations[ind + v])
}
</script>

<template>
  <div class="exp-menu-container">
    <div class="exp-menu">
      <div class="exp-label">clock</div>
      <div class="exp-value">
        <div class="exp-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none">
            <g>
              <path
                d="M6 0.75C8.89949 0.75 11.25 3.1005 11.25 6C11.25 8.89949 8.89949 11.25 6 11.25C3.1005 11.25 0.75 8.89949 0.75 6C0.75 3.1005 3.1005 0.75 6 0.75Z"
                stroke="currentColor"
                stroke-width="1.5"></path>
              <path d="M6 3L6.01666 6L8.29037 7.50714" stroke="currentColor" stroke-width="1.5"></path>
            </g>
          </svg>
        </div>
        <span v-if="chartState.currentExpiration">{{ formatExp(chartState.currentExpiration.expiration.close) }}</span>
        <span v-else>...</span>
      </div>
    </div>
    <div class="exp-ticks">
      <div class="exp-tick" @click="step(-1)"><span></span></div>
      <div class="exp-tick" @click="step(1)"><span></span><span></span></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'ExpirationMenu.scss';
</style>

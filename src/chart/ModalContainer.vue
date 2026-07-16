<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import { useModal, useModalState } from '@chart/composables/useModal'

const { current } = useModalState()
const { close } = useModal()

const closeModal = (result?: unknown) => {
  if (!current.value) {
    throw `Can't close. Modal doesn't exist. ${result}`
  }

  current.value.result.resolve(result)
  setTimeout(close)
}

onKeyStroke('Escape', () => {
  if (current.value) {
    closeModal()
  }
})
</script>

<template>
  <div v-if="current" class="mwc-modal" @click="closeModal()">
    <component :is="current.component" v-bind="current.props" @click.stop @close="closeModal($event)" />
  </div>
</template>

<style lang="scss" scoped>
.mwc-modal {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

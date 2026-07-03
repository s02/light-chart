<script setup lang="ts">
import CInput from '@chart/components/Controls/CInput.vue'
import CloseIcon from '@chart/components/CloseIcon.vue'
import { ref } from 'vue'
import CButton from '@chart/components/Controls/CButton.vue'

const name = ref<string>('')
const emit = defineEmits<(e: 'close', name?: string) => void>()
</script>

<template>
  <div class="save-study">
    <div class="save-study-header">
      <button class="save-study-close" @click="emit('close')"><CloseIcon /></button>
    </div>
    <div class="save-study-title">Save New Chart Layout</div>
    <div class="save-study-body">
      <CInput v-model="name" class="save-study-input" />
    </div>
    <div class="save-study-footer">
      <CButton type="primary" :disabled="!name || !name.length" @click="emit('close', name)">Save</CButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'ModalStudyName.scss';
</style>

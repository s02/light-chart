<script setup lang="ts">
import CInput from '@chart/components/Controls/CInput.vue'
import CloseIcon from '@chart/components/CloseIcon.vue'
import { ref } from 'vue'
import CButton from '@chart/components/Controls/CButton.vue'
import { i18n } from '@chart/i18n'

const name = ref<string>('')
const emit = defineEmits<(e: 'close', name?: string) => void>()
</script>

<template>
  <div class="mwc-save-study">
    <div class="mwc-save-study-header">
      <button class="mwc-save-study-close" @click="emit('close')"><CloseIcon /></button>
    </div>
    <div class="mwc-save-study-title">{{ i18n.translate('modal-templates-save-title') }}</div>
    <div class="mwc-save-study-body">
      <CInput v-model="name" class="mwc-save-study-input" />
    </div>
    <div class="mwc-save-study-footer">
      <CButton type="primary" :disabled="!name || !name.length" @click="emit('close', name)">{{
        i18n.translate('modal-templates-save')
      }}</CButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'ModalStudyName.scss';
</style>

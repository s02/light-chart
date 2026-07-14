<script setup lang="ts">
import CButton from '@chart/components/Controls/CButton.vue'
import CToggleButton from '@chart/components/Controls/CToggleButton.vue'
import ModalStudyName from '@chart/components/StudyRepository/ModalStudyName.vue'
import ModalStudyTemplates from '@chart/components/StudyRepository/ModalStudyTemplatesList.vue'
import FloatingDropdown from '@chart/components/FloatingDropdown.vue'
import { useModal } from '@chart/composables/useModal'
import ChartMenuItem from '@chart/components/ChartMenuItem.vue'
import ChartMenuGroup from '@chart/components/ChartMenuGroup.vue'
import { useEngineApi } from '@chart/composables/useEngine'
import type { Layout } from '@engine/indicators/types'
import { getStudyRepository } from '@chart/components/StudyRepository/getStudyRepository'
import { i18n } from '@chart/i18n'

const { open } = useModal()
const { getLayoutConfig, setLayoutConfig } = useEngineApi()

const isOpened = defineModel<boolean>({ default: false })
const repository = getStudyRepository()

const openLayoutName = () => {
  isOpened.value = false
  open<string | undefined>(ModalStudyName).then((name?: string) => {
    if (!name) {
      return
    }

    repository.save(name, getLayoutConfig())
  })
}

const openLayoutList = () => {
  isOpened.value = false

  open<Layout | undefined>(ModalStudyTemplates).then((layout) => {
    if (!layout) {
      return
    }

    setLayoutConfig(layout.config)
  })
}
</script>

<template>
  <div class="mwc-study-r">
    <CButton type="transparent" @click="openLayoutName">{{ i18n.translate('menu-save-layout') }}</CButton>
    <FloatingDropdown :open="isOpened" @update:open="isOpened = false">
      <template #trigger="{ triggerRef }">
        <CToggleButton :ref="triggerRef" :is-opened="isOpened" class="mwc-study-r-toggle" @click="isOpened = true" />
      </template>
      <div class="mwc-study-r-menu">
        <ChartMenuGroup>
          <ChartMenuItem @click="openLayoutName">{{ i18n.translate('menu-save-layout') }}</ChartMenuItem>
        </ChartMenuGroup>
        <ChartMenuGroup>
          <ChartMenuItem @click="openLayoutList">{{ i18n.translate('menu-open-layout') }}</ChartMenuItem>
        </ChartMenuGroup>
      </div>
    </FloatingDropdown>
  </div>
</template>

<style lang="scss" scoped>
@use 'StudyRepository.scss';
</style>

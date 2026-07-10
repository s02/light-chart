<script setup lang="ts">
import CloseIcon from '@chart/components/CloseIcon.vue'
import { getStudyRepository } from '@chart/components/StudyRepository/getStudyRepository'
import type { Layout } from '@engine/indicators/types'
import { ref } from 'vue'

const repository = getStudyRepository()
const layouts = ref<Layout[]>(repository.load())

const emit = defineEmits<(e: 'close', result?: Layout) => void>()

const getDetails = (layout: Layout) => {
  const studies = [...layout.config.indicators.map((ind) => ind.ikey), ...layout.config.drawings.map((ind) => ind.ikey)]
  const set = new Set<string>()
  studies.forEach((key) => {
    set.add(key)
  })

  return Array.from(set).join(', ')
}

const remove = (layout: Layout) => {
  layouts.value = repository.delete(layout.name)
}
</script>

<template>
  <div class="mwc-study-list">
    <div class="mwc-study-list-header">
      <div class="mwc-study-list-title">Layouts</div>
      <button class="mwc-study-list-close" @click="emit('close')"><CloseIcon /></button>
    </div>
    <div class="mwc-study-list-body">
      <template v-if="layouts.length">
        <div v-for="layout in layouts" :key="layout.name" class="mwc-study-item" @click="emit('close', layout)">
          <div class="mwc-study-item-body">
            <div class="mwc-study-item-name">{{ layout.name }}</div>
            <div class="mwc-study-item-details">{{ getDetails(layout) }}</div>
          </div>
          <div class="mwc-study-item-aside">
            <div class="mwc-study-item-del" @click.stop="remove(layout)">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18">
                <path
                  fill="currentColor"
                  d="M12 4h3v1h-1.04l-.88 9.64a1.5 1.5 0 0 1-1.5 1.36H6.42a1.5 1.5 0 0 1-1.5-1.36L4.05 5H3V4h3v-.5C6 2.67 6.67 2 7.5 2h3c.83 0 1.5.67 1.5 1.5V4ZM7.5 3a.5.5 0 0 0-.5.5V4h4v-.5a.5.5 0 0 0-.5-.5h-3ZM5.05 5l.87 9.55a.5.5 0 0 0 .5.45h5.17a.5.5 0 0 0 .5-.45L12.94 5h-7.9Z"></path>
              </svg>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="mwc-study-list-empty">No saved layouts</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'ModalStudyTemplatesList.scss';
</style>

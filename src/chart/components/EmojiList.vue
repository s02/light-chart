<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ChartMenuGroup from '@chart/components/ChartMenuGroup.vue'

const emit = defineEmits<{
  (e: 'click', emoji: string): void
}>()

const categoryNames = ['smileys', 'people', 'animals', 'food', 'travel', 'activities', 'objects', 'symbols', 'flags']

type Emoji = { emoji: string; category: number; name: string; version: string }

const groups = ref<Map<number, Emoji[]>>(new Map())

onMounted(async () => {
  const { default: list } = await import('./EmojiList.json')
  const map = new Map<number, Emoji[]>()
  for (const item of list as Emoji[]) {
    let bucket = map.get(item.category)
    if (!bucket) {
      bucket = []
      map.set(item.category, bucket)
    }
    bucket.push(item)
  }
  groups.value = map
})
</script>

<template>
  <ChartMenuGroup v-for="[categoryIndex, emojis] in groups" :key="categoryIndex" :name="categoryNames[categoryIndex]">
    <div class="mwc-emoji-group">
      <span
        v-for="emoji in emojis"
        :key="emoji.name"
        class="mwc-emoji"
        :title="emoji.name"
        @click="emit('click', emoji.emoji)"
        >{{ emoji.emoji }}</span
      >
    </div>
  </ChartMenuGroup>
</template>

<style lang="scss" scoped>
@use 'EmojiList.scss';
</style>

<script setup lang="ts">
import type { DictionaryEntry } from '@/types'

defineProps<{
  word: DictionaryEntry
  getTagDisplay: (tag: string) => string
}>()
</script>

<template>
  <div class="mb-4 flex flex-wrap gap-2">
    <span
      v-for="tag in word.tag || []"
      :key="tag"
      class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
    >
      {{ getTagDisplay(tag) }}
    </span>
    <span
      v-if="word.collins"
      class="bg-theme-2 text-theme-7 rounded-full px-3 py-1 text-sm"
    >
      柯林斯 {{ word.collins }}星
    </span>
  </div>
</template>

<script setup lang="ts">
import type { DictionaryEntry } from '@/types'
import FrequencyIndicator from '@/components/dictionary/FrequencyIndicator.vue'

const props = defineProps<{
  word: DictionaryEntry
  clickable?: boolean
  shortTranslation: string
  frequencyLevel: number
}>()

const emit = defineEmits<{
  (e: 'click', word: DictionaryEntry): void
}>()

function handleClick() {
  if (props.clickable)
    emit('click', props.word)
}
</script>

<template>
  <div
    class="flex items-center gap-3 rounded-md px-4 py-3 transition-all active:bg-gray-200 hover:bg-gray-100"
    :class="{ 'cursor-pointer': clickable }"
    @click="handleClick"
  >
    <div class="min-w-[100px] flex items-center gap-1 text-gray-800 font-medium">
      {{ word.word }}
      <FrequencyIndicator v-if="frequencyLevel > 0" :level="frequencyLevel" />
    </div>
    <div class="text-sm text-gray-500">
      {{ word.phonetic ? `/${word.phonetic}/` : '' }}
    </div>
    <div class="flex-1 truncate text-sm text-gray-600">
      {{ shortTranslation }}
    </div>
  </div>
</template>

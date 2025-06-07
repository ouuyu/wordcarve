<script setup lang="ts">
import type { DictionaryEntry } from '@/types'
import FrequencyIndicator from '@/components/dictionary/FrequencyIndicator.vue'
import { NButton } from 'naive-ui'
import { PronunciationType } from '@/utils/audio'

defineProps<{
  word: DictionaryEntry
  frequencyLevel: number
}>()

const emit = defineEmits<{
  (e: 'playPronunciation', type: PronunciationType, event: MouseEvent): void
}>()

function playPronunciation(type: PronunciationType, event: MouseEvent) {
  event.stopPropagation()
  emit('playPronunciation', type, event)
}
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="mb-2 flex flex-wrap items-center">
      <span class="flex items-center break-all text-3xl font-bold">
        {{ word.word }}
        <FrequencyIndicator
          v-if="frequencyLevel > 0"
          :level="frequencyLevel"
          class="ml-2"
        />
      </span>
      <div class="flex flex-wrap items-center px-2">
        <span class="text-gray-600">
          {{ word.phonetic ? `/${word.phonetic}/` : '' }}
        </span>
        <div class="flex px-2">
          <NButton
            text
            size="small"
            @click="e => playPronunciation(PronunciationType.US, e)"
          >
            <template #icon>
              <div class="i-carbon:audio"></div>
            </template>
            美
          </NButton>
          <NButton
            text
            size="small"
            @click="e => playPronunciation(PronunciationType.UK, e)"
          >
            <template #icon>
              <div class="i-carbon:audio"></div>
            </template>
            英
          </NButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.break-all {
  word-break: break-all;
}
</style>

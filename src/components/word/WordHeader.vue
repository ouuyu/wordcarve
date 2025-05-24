<script setup lang="ts">
import type { DictionaryEntry } from '@/types'
import FrequencyIndicator from '@/components/dictionary/FrequencyIndicator.vue'
import Button from '@/components/ui/Button.vue'
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
        <FrequencyIndicator v-if="frequencyLevel > 0" :level="frequencyLevel" class="ml-2" />
      </span>
      <div class="flex flex-wrap items-center px-2">
        <span class="text-gray-600">
          {{ word.phonetic ? `/${word.phonetic}/` : '' }}
        </span>
        <div class="flex px-2">
          <Button
            type="text"
            size="xs"
            icon="carbon:audio"
            @click="(e) => playPronunciation(PronunciationType.US, e)"
          >
            美
          </Button>
          <Button
            type="text"
            size="xs"
            icon="carbon:audio"
            @click="(e) => playPronunciation(PronunciationType.UK, e)"
          >
            英
          </Button>
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

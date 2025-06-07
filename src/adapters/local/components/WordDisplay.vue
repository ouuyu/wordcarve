<script setup lang="ts">
import type { DictionaryEntry } from '@/types'
import { useDictionaryEntry } from '@/composables/useDictionaryEntry'
import { onMounted } from 'vue'

// 导入子组件
import WordDisplayMini from './WordDisplayMini.vue'
import WordForms from './WordForms.vue'
import WordHeader from './WordHeader.vue'
import WordMeanings from './WordMeanings.vue'
import WordTags from './WordTags.vue'
import WordUsages from './WordUsages.vue'

const props = defineProps<{
  word: DictionaryEntry
  mode?: 'normal' | 'mini'
  clickable?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', word: DictionaryEntry): void
  (e: 'example-click', example: any): void
}>()

// 添加调试信息
onMounted(() => {
  console.log('WordDisplay mounted with word:', props.word)
  console.log('Word structure:', {
    word: props.word.word,
    phonetic: props.word.phonetic,
    definition: props.word.definition,
    translation: props.word.translation,
    meanings: props.word.meanings,
    pos: props.word.pos,
    tag: props.word.tag,
  })
})

const {
  isMiniMode,
  shortTranslation,
  mergedMeanings,
  selectedMeaning,
  selectMeaning,
  isMeaningSelected,
  getTagDisplay,
  playPronunciation,
  handleClick,
  handleExampleClick,
  wordForms,
  frequencyLevel,
} = useDictionaryEntry(props, emit)
</script>

<template>
  <div class="relative">
    <!-- Mini Mode -->
    <WordDisplayMini
      v-if="isMiniMode"
      :word="word"
      :clickable="clickable"
      :short-translation="shortTranslation"
      :frequency-level="frequencyLevel"
      @click="handleClick"
    />

    <!-- Normal Mode -->
    <div
      v-else
      class="w-full flex flex-col items-start rounded-lg p-2 transition-all"
      :class="{ 'cursor-pointer hover:bg-gray-50 active:bg-gray-100': clickable }"
      @click="clickable ? handleClick() : undefined"
    >
      <div class="w-full overflow-x-hidden">
        <WordHeader
          :word="word"
          :frequency-level="frequencyLevel"
          @play-pronunciation="playPronunciation"
        />

        <WordTags
          :word="word"
          :get-tag-display="getTagDisplay"
        />

        <WordMeanings
          :word="word"
          :merged-meanings="mergedMeanings"
          :selected-meaning="selectedMeaning"
          :is-meaning-selected="isMeaningSelected"
          @select-meaning="selectMeaning"
          @example-click="handleExampleClick"
        />

        <WordForms :word-forms="wordForms" />
      </div>

      <WordUsages :word="word" />
    </div>
  </div>
</template>

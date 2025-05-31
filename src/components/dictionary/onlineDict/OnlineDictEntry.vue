<script setup lang="ts">
import { PropType } from 'vue'
import MyText from '@/components/my/MyText.vue'
import FrequencyIndicator from '@/components/dictionary/FrequencyIndicator.vue'
import WordTags from '@/components/word/WordTags.vue'
import OnlineDictDefinitions from '@/components/dictionary/onlineDict/OnlineDictDefinitions.vue'
import OnlineDictCollocations from '@/components/dictionary/onlineDict/OnlineDictCollocations.vue'
import OnlineDictSynAnt from '@/components/dictionary/onlineDict/OnlineDictSynAnt.vue'

interface WordForm {
  type: string
  form: string
}

interface Pronunciation {
  US: string
  UK: string
}

interface DictionaryEntry {
  headword: string
  pronunciations: Pronunciation
  tags?: string[]
  wordForms?: WordForm[]
  collocations?: any[]
  synonyms?: any[]
  antonyms?: any[]
  definitions?: any
}

defineProps({
  entry: {
    type: Object as PropType<DictionaryEntry>,
    required: true,
  },
  frequencyLevel: {
    type: Number,
    required: true,
  },
  wordFormMapping: {
    type: Object as PropType<Record<string, string>>,
    required: true,
  },
  externalDictionaries: {
    type: Array as PropType<any[]>,
    required: true,
  },
  getTagDisplay: {
    type: Function as PropType<(tag: string) => string>,
    required: true,
  },
  playPronunciation: {
    type: Function as PropType<(word: string, type: 'US' | 'UK') => void>,
    required: true,
  },
  openExternalDictionary: {
    type: Function as PropType<(url: string) => void>,
    required: true,
  },
})
</script>

<template>
  <div class="p-4 bg-white dark:bg-dark-800 rounded-xl shadow-sm space-y-4">
    <!-- Headword and Pronunciation -->
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-2 flex-1">
        <div class="flex items-center gap-3">
          <h2 class="text-2xl font-semibold tracking-tight">
            <MyText :text="entry.headword" />
          </h2>
          <FrequencyIndicator
            v-if="frequencyLevel > 0"
            :level="frequencyLevel"
            class="transform scale-110"
          />
          <!-- Word Tags -->
          <div
            v-if="entry.tags?.length"
            class="flex flex-wrap gap-1.5"
          >
            <WordTags
              :word="{
                word: entry.headword,
                phonetic: '',
                definition: [],
                translation: [],
                pos: {},
                tag: entry.tags,
              }"
              :get-tag-display="getTagDisplay"
            />
          </div>
        </div>
        <div class="flex items-center gap-4 text-sm">
          <div class="flex items-center gap-3">
            <span class="flex items-center gap-1.5">
              <span class="font-medium op-50">US</span>
              <MyText
                :text="entry.pronunciations?.US"
                class="font-mono"
              />
              <button
                v-if="entry.pronunciations?.US"
                class="inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-primary/10 active:bg-primary/20 text-primary transition-colors"
                title="美式发音"
                @click="() => playPronunciation(entry.headword, 'US')"
              >
                <div i-carbon-volume-up />
              </button>
            </span>
            <span class="flex items-center gap-1.5">
              <span class="font-medium op-50">UK</span>
              <MyText
                :text="entry.pronunciations?.UK"
                class="font-mono"
              />
              <button
                v-if="entry.pronunciations?.UK"
                class="inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-primary/10 active:bg-primary/20 text-primary transition-colors"
                title="英式发音"
                @click="() => playPronunciation(entry.headword, 'UK')"
              >
                <div i-carbon-volume-up />
              </button>
            </span>
          </div>
          <!-- External Dictionary Links -->
          <div class="flex items-center gap-1.5">
            <button
              v-for="dict in externalDictionaries"
              :key="dict.name"
              class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-50 hover:bg-gray-100 dark:bg-dark-700/50 dark:hover:bg-dark-600/50 transition-colors"
              @click="() => openExternalDictionary(dict.url + entry.headword)"
            >
              <div :class="[dict.icon, 'text-base op-60']" />
              <span class="hidden sm:inline">{{ dict.name }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Word Forms -->
    <div
      v-if="entry.wordForms?.length"
      class="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 px-3 text-sm bg-gray-50 dark:bg-dark-700/50 rounded-lg"
    >
      <div class="flex items-center gap-1.5 text-primary">
        <div i-carbon-text-font />
        <span class="font-medium">词形变化</span>
      </div>
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span
          v-for="form in entry.wordForms"
          :key="form.type"
          class="flex items-center gap-1.5"
        >
          <span class="text-xs op-50">{{ wordFormMapping[form.type] || form.type }}</span>
          <span class="font-medium">{{ form.form }}</span>
        </span>
      </div>
    </div>

    <!-- Definitions Section -->
    <div
      v-if="entry.definitions"
      class="pt-2"
    >
      <OnlineDictDefinitions :entry="entry" />
    </div>

    <!-- Collocations Section -->
    <div
      v-if="entry.collocations?.length"
      class="pt-3 border-t border-gray-100 dark:border-dark-700"
    >
      <div class="flex items-center gap-2 text-base font-medium mb-3">
        <div i-carbon-connection />
        常用搭配
      </div>

      <OnlineDictCollocations :collocations="entry.collocations" />
    </div>

    <!-- Synonyms & Antonyms Section -->
    <div
      v-if="entry.synonyms?.length || entry.antonyms?.length"
      class="pt-3 border-t border-gray-100 dark:border-dark-700"
    >
      <div class="flex items-center gap-2 text-base font-medium mb-3">
        <div i-carbon-compare />
        同反义词
      </div>

      <OnlineDictSynAnt
        :synonyms="entry.synonyms || []"
        :antonyms="entry.antonyms || []"
      />
    </div>
  </div>
</template>

<style scoped>
/* 移除所有样式，全部使用 UnoCSS */
</style>

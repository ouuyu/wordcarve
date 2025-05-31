<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import ky from 'ky'
import { Message } from '@/utils/message'
import { Space, SkeletonLine } from '@/components/ui'
import { playWordPronunciation, PronunciationType } from '@/utils/audio'
import WordTags from '@/components/word/WordTags.vue'
import FrequencyIndicator from '@/components/dictionary/FrequencyIndicator.vue'
import OnlineDictEntry from '@/components/dictionary/onlineDict/OnlineDictEntry.vue'
import OnlineDictDefinitions from '@/components/dictionary/onlineDict/OnlineDictDefinitions.vue'
import OnlineDictCollocations from '@/components/dictionary/onlineDict/OnlineDictCollocations.vue'
import OnlineDictSynAnt from '@/components/dictionary/onlineDict/OnlineDictSynAnt.vue'

interface Pronunciation {
  US: string
  UK: string
}

interface Definition {
  Chinese: string
  English: string
}

interface Example {
  English: string
  Chinese: string
}

interface Sense {
  sense_number: string
  sense_label: string
  definition: Definition
  examples: Example[]
}

interface DictionaryDefinition {
  part_of_speech: string
  senses?: Sense[]
  definitions?: string[]
}

interface DictionaryEntry {
  headword: string
  pronunciations: Pronunciation
  definitions: {
    权威英汉双解: DictionaryDefinition[]
    英汉: DictionaryDefinition[]
    英英: DictionaryDefinition[]
  }
  collocations: {
    type: string
    items: string[]
  }[]
  synonyms: {
    part_of_speech: string
    items: string[]
  }[]
  antonyms: {
    part_of_speech: string
    items: string[]
  }[]
  tags?: string[]
  frequency?: number
  wordForms?: {
    type: string
    form: string
  }[]
}

const props = defineProps<{
  query: string
}>()

const loading = ref(false)
const wordData = ref<DictionaryEntry[]>([])
const error = ref<string | null>(null)
const retryCount = ref(0)
const maxRetries = 3
const activeTab = ref<'comprehensive' | 'collocation' | 'synant'>('comprehensive')

// External dictionary links
const externalDictionaries = [
  {
    name: '剑桥词典',
    url: 'https://dictionary.cambridge.org/dictionary/english/',
    icon: 'i-carbon-book',
  },
  {
    name: '柯林斯词典',
    url: 'https://www.collinsdictionary.com/dictionary/english/',
    icon: 'i-carbon-translate',
  },
]

// Tag mapping
const tagMapping: Record<string, string> = {
  zk: '中考',
  gk: '高考',
  cet4: '四级',
  cet6: '六级',
  ky: '考研',
  toefl: '托福',
  ielts: '雅思',
  gre: 'GRE',
}

// Word form mapping
const wordFormMapping: Record<string, string> = {
  p: '过去式',
  d: '过去分词',
  i: '现在分词',
  3: '第三人称单数',
  r: '比较级',
  t: '最高级',
  s: '复数',
}

// Calculate frequency level (1-5)
const frequencyLevel = computed(() => {
  if (!wordData.value[0]?.frequency) return 0
  const freq = wordData.value[0].frequency
  if (freq <= 1000) return 5
  if (freq <= 3000) return 4
  if (freq <= 6000) return 3
  if (freq <= 10000) return 2
  return 1
})

const getTagDisplay = (tag: string) => tagMapping[tag] || tag

const fetchWord = async (word: string) => {
  if (!word.trim()) return

  loading.value = true
  error.value = null

  try {
    const response = await ky
      .get(`https://supabase.wordcarve.com/functions/v1/query-word`, {
        searchParams: { query: word.trim() },
        retry: {
          limit: maxRetries,
          methods: ['get'],
        },
      })
      .json<DictionaryEntry[]>()

    wordData.value = response
    retryCount.value = 0
  } catch (err) {
    console.error('Error fetching word:', err)
    error.value = 'Failed to fetch word definition'
    Message.error('获取单词释义失败')
    retryCount.value++

    if (retryCount.value < maxRetries) {
      setTimeout(() => fetchWord(word), 1000 * retryCount.value)
    }
  } finally {
    loading.value = false
  }
}

const playPronunciation = async (type: PronunciationType, event?: Event) => {
  if (event) event.stopPropagation()
  if (!wordData.value[0]?.headword) return

  try {
    await playWordPronunciation(wordData.value[0].headword, type)
  } catch {
    Message.error('播放发音失败')
  }
}

const openExternalDictionary = (url: string) => {
  if (!wordData.value[0]?.headword) return
  window.open(url + wordData.value[0].headword, '_blank')
}

watch(
  () => props.query,
  newQuery => {
    if (newQuery) {
      fetchWord(newQuery)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="online-dict">
    <!-- Loading State -->
    <div
      v-if="loading"
      class="loading-state"
    >
      <Space
        vertical
        class="w-full"
      >
        <SkeletonLine w="40%" />
        <SkeletonLine w="100%" />
        <SkeletonLine w="80%" />
        <SkeletonLine w="90%" />
      </Space>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="error-state"
    >
      <div
        i-carbon-warning
        text-4xl
        mb-4
      />
      <p class="error-message">{{ error }}</p>
      <button
        class="retry-button"
        @click="searchWord"
      >
        重试
      </button>
    </div>

    <!-- Results -->
    <template v-else-if="wordData.length > 0">
      <div
        v-for="(entry, index) in wordData"
        :key="index"
        class="word-entry"
      >
        <OnlineDictEntry
          :entry="entry"
          :frequency-level="entry.frequency || 0"
          :word-form-mapping="tagMapping"
          :external-dictionaries="externalDictionaries"
          :get-tag-display="tag => tagMapping[tag] || tag"
          :play-pronunciation="playWordPronunciation"
          :open-external-dictionary="openExternalDictionary"
        />

        <!-- Content Tabs -->
        <div class="content-tabs">
          <button
            class="tab-button"
            :class="{ active: activeTab === 'comprehensive' }"
            @click="activeTab = 'comprehensive'"
          >
            <div
              i-carbon-book
              mr-2
            />
            释义与例句
          </button>
          <button
            v-if="entry.collocations?.length"
            class="tab-button"
            :class="{ active: activeTab === 'collocation' }"
            @click="activeTab = 'collocation'"
          >
            <div
              i-carbon-connection
              mr-2
            />
            搭配
          </button>
          <button
            v-if="entry.synonyms?.length || entry.antonyms?.length"
            class="tab-button"
            :class="{ active: activeTab === 'synant' }"
            @click="activeTab = 'synant'"
          >
            <div
              i-carbon-compare
              mr-2
            />
            同反义词
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <OnlineDictEntry
            v-if="activeTab === 'comprehensive'"
            :entry="entry"
            :frequency-level="entry.frequency || 0"
            :word-form-mapping="tagMapping"
            :external-dictionaries="externalDictionaries"
            :get-tag-display="tag => tagMapping[tag] || tag"
          />
          <OnlineDictCollocations
            v-else-if="activeTab === 'collocation'"
            :collocations="entry.collocations"
          />
          <OnlineDictSynAnt
            v-else-if="activeTab === 'synant'"
            :synonyms="entry.synonyms"
            :antonyms="entry.antonyms"
          />
        </div>
      </div>
    </template>

    <!-- No Results -->
    <div
      v-else-if="!loading && query"
      class="no-results"
    >
      <div
        i-carbon-search-locate
        text-4xl
        mb-4
      />
      <p>未找到相关单词</p>
    </div>
  </div>
</template>

<style scoped>
.online-dict {
  @apply space-y-6;
}

.loading-state,
.error-state {
  @apply flex flex-col items-center justify-center py-12;
}

.error-message {
  @apply text-red-500 mb-4;
}

.retry-button {
  @apply px-4 py-2 rounded-lg bg-primary text-white
    hover:bg-primary-600 active:bg-primary-700 transition-colors;
}

.word-entry {
  @apply bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm;
}

.word-header {
  @apply p-6 border-b border-gray-100 dark:border-gray-700 space-y-4;
}

.word-title {
  @apply flex flex-wrap gap-4 items-start justify-between;
}

.word-title h2 {
  @apply text-2xl font-medium;
}

.word-meta {
  @apply flex flex-wrap items-center gap-2;
}

.frequency-badge {
  @apply text-sm;
}

.word-tags {
  @apply flex-wrap gap-1;
}

.pronunciations {
  @apply flex flex-wrap gap-6;
}

.pronunciation-item {
  @apply flex items-center gap-2;
}

.accent-label {
  @apply text-sm text-gray-500 dark:text-gray-400;
}

.phonetic {
  @apply font-mono;
}

.play-button {
  @apply p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700
    text-gray-600 dark:text-gray-400 transition-colors;
}

.external-links {
  @apply flex flex-wrap gap-3;
}

.external-link {
  @apply flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
    bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
    text-gray-700 dark:text-gray-300 transition-colors;
}

.content-tabs {
  @apply flex gap-2 p-4 border-b border-gray-100 dark:border-gray-700
    bg-gray-50 dark:bg-gray-800/50;
}

.tab-button {
  @apply flex items-center px-4 py-2 rounded-lg text-sm
    text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700
    transition-colors;
}

.tab-button.active {
  @apply bg-primary text-white hover:bg-primary-600;
}

.tab-content {
  @apply p-6;
}

.no-results {
  @apply flex flex-col items-center justify-center py-12
    text-gray-500 dark:text-gray-400;
}
</style>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s linear;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

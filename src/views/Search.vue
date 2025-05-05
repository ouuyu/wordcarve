<script setup lang="ts">
import type { DictionaryEntry } from '../types'
import WordDisplay from '@/components/dictionary/WordDisplay.vue'
import { useDictionaryStore } from '@/stores/dictionaryStore'
import { Message } from '@arco-design/web-vue'
import { IconBook } from '@arco-design/web-vue/es/icon'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const searchQuery = ref('')
const loading = ref(false)
const dictionaryStore = useDictionaryStore()
const searchResult = ref<DictionaryEntry | null>(null)
const recentSearches = ref<string[]>([])
const searchInputRef = ref<HTMLInputElement | null>(null)
const route = useRoute()
const router = useRouter()

async function searchWord() {
  if (!searchQuery.value.trim()) {
    Message.warning('请输入要查询的单词')
    return
  }

  loading.value = true
  try {
    searchResult.value = dictionaryStore.searchWord(searchQuery.value.trim())

    if (searchResult.value) {
      if (!recentSearches.value.includes(searchQuery.value.trim())) {
        recentSearches.value.unshift(searchQuery.value.trim())
        recentSearches.value = recentSearches.value.slice(0, 10)
        localStorage.setItem('recent-searches', JSON.stringify(recentSearches.value))
      }

      updateUrlQuery(searchQuery.value.trim())
    }
    else {
      Message.info('没有找到该单词')
    }
  }
  catch (error) {
    console.error('Error searching word:', error)
    Message.error('查询单词时出错')
  }
  finally {
    loading.value = false
  }
}

function handleRecentSearch(word: string) {
  searchQuery.value = word
  searchWord()
}

function focusSearchInput() {
  searchInputRef.value?.focus()
}

function updateUrlQuery(query: string) {
  router.push({
    query: { q: query },
  })
}

function searchFromUrlQuery() {
  const queryParam = route.query.q
  if (queryParam && typeof queryParam === 'string') {
    searchQuery.value = queryParam
    searchWord()
  }
}
watch(
  () => route.query.q,
  (newQuery) => {
    if (newQuery && typeof newQuery === 'string' && newQuery !== searchQuery.value) {
      searchQuery.value = newQuery
      searchWord()
    }
  },
)

onMounted(() => {
  if (!dictionaryStore.dictionary.length) {
    dictionaryStore.loadDictionary()
  }

  try {
    const saved = localStorage.getItem('recent-searches')
    if (saved) {
      recentSearches.value = JSON.parse(saved)
    }
  }
  catch (error) {
    console.error('Failed to load recent searches:', error)
  }

  searchFromUrlQuery()

  if (!route.query.q) {
    focusSearchInput()
  }
})
</script>

<template>
  <div class="max-w-2xl">
    <div class="flex flex-col items-start">
      <input
        ref="searchInputRef"
        v-model="searchQuery" type="text" class="w-full border-b border-transparent bg-transparent text-left text-4xl outline-none focus:border-b-gray-200/50"
        @click="focusSearchInput"
        @keyup.enter="searchWord"
      >

      <div v-if="loading" class="mt-6">
        <a-spin dot />
      </div>

      <div v-if="recentSearches.length && !searchResult" class="mt-6 max-w-xl w-full">
        <div class="flex flex-wrap gap-2">
          <a-tag
            v-for="word in recentSearches" :key="word" size="medium" bordered
            class="cursor-pointer border-gray-200/30 bg-transparent px-3 py-1 hover:border-gray-300/50"
            @click="handleRecentSearch(word)"
          >
            {{ word }}
          </a-tag>
        </div>
      </div>
    </div>

    <div v-if="searchResult" class="mt-4 w-full flex py-4">
      <div class="max-w-3xl w-full">
        <WordDisplay :word="searchResult" class="border border-gray-100/20 rounded-lg bg-white/10 p-6 shadow-sm" />
      </div>
    </div>
  </div>

  <a-empty
    v-if="!dictionaryStore.dictionary.length" class="absolute left-0 right-0 top-1/2 -translate-y-1/2"
    description="没有加载字典数据"
  >
    <template #image>
      <IconBook class="text-6xl text-gray-300" />
    </template>
  </a-empty>
</template>

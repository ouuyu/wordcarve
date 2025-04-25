<script setup lang="ts">
import type { DictionaryEntry } from '../types'
import { Message } from '@arco-design/web-vue'
import { IconBook } from '@arco-design/web-vue/es/icon'
import { onMounted, ref } from 'vue'
import DictionaryManager from '../components/dictionary/DictionaryManager.vue'
import WordDisplay from '../components/dictionary/WordDisplay.vue'
import { useDictionaryStore } from '../stores/dictionaryStore'

const searchQuery = ref('')
const loading = ref(false)
const dictionaryStore = useDictionaryStore()
const searchResult = ref<DictionaryEntry | null>(null)
const recentSearches = ref<string[]>([])

async function searchWord() {
  if (!searchQuery.value.trim()) {
    Message.warning('请输入要查询的单词')
    return
  }

  loading.value = true
  try {
    // Search for the word in the store
    searchResult.value = dictionaryStore.searchWord(searchQuery.value.trim())

    // Add to recent searches if found
    if (searchResult.value) {
      if (!recentSearches.value.includes(searchQuery.value.trim())) {
        recentSearches.value.unshift(searchQuery.value.trim())
        // Keep only the last 10 searches
        recentSearches.value = recentSearches.value.slice(0, 10)
        // Save to localStorage
        localStorage.setItem('recent-searches', JSON.stringify(recentSearches.value))
      }
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

onMounted(() => {
  // Load the dictionary
  if (!dictionaryStore.dictionary.length) {
    dictionaryStore.loadDictionary()
  }

  // Load recent searches from localStorage
  try {
    const saved = localStorage.getItem('recent-searches')
    if (saved) {
      recentSearches.value = JSON.parse(saved)
    }
  }
  catch (error) {
    console.error('Failed to load recent searches:', error)
  }
})
</script>

<template>
  <div class="search-page">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">
        单词查询
      </h1>
      <DictionaryManager />
    </div>

    <div class="search-container mb-8">
      <a-input-search
        v-model="searchQuery"
        placeholder="输入要查询的单词"
        search-button
        allow-clear
        :loading="loading"
        class="mb-4 max-w-md"
        @search="searchWord"
        @press-enter="searchWord"
      />

      <!-- Recent searches -->
      <div v-if="recentSearches.length" class="mt-2">
        <p class="mb-2 text-sm text-gray-500">
          最近搜索:
        </p>
        <div class="flex flex-wrap gap-2">
          <a-tag
            v-for="word in recentSearches"
            :key="word"
            size="small"
            checkable
            checked
            class="cursor-pointer"
            @click="handleRecentSearch(word)"
          >
            {{ word }}
          </a-tag>
        </div>
      </div>
    </div>

    <!-- Search result -->
    <WordDisplay v-if="searchResult" :word="searchResult" class="mb-6 max-w-3xl" />

    <!-- No dictionary loaded message -->
    <a-empty
      v-if="!dictionaryStore.dictionary.length"
      class="mt-8"
      description="没有加载字典数据"
    >
      <template #image>
        <IconBook class="text-6xl text-gray-300" />
      </template>
    </a-empty>
  </div>
</template>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">本地词典测试</h1>
    
    <div class="mb-4">
      <input 
        v-model="testQuery" 
        placeholder="输入测试单词" 
        class="border border-gray-300 rounded px-3 py-2 mr-2"
      >
      <button 
        @click="testSearch" 
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        测试搜索
      </button>
    </div>

    <div class="mb-4">
      <h2 class="text-lg font-semibold mb-2">词典状态</h2>
      <div class="bg-gray-100 p-3 rounded">
        <p>词典已加载: {{ dictionaryStore.isLoaded }}</p>
        <p>词典条目数: {{ dictionaryStore.dictionary.length }}</p>
        <p>当前查询: {{ testQuery }}</p>
      </div>
    </div>

    <div class="mb-4">
      <h2 class="text-lg font-semibold mb-2">搜索结果</h2>
      <div v-if="loading" class="text-blue-500">搜索中...</div>
      <div v-else-if="error" class="text-red-500">错误: {{ error }}</div>
      <div v-else-if="result">
        <LocalDictionaryRenderer
          :result="result"
          :error="error"
          :loading="loading"
          :query="testQuery"
          @retry="testSearch"
          @word-click="handleWordClick"
          @example-click="handleExampleClick"
        />
      </div>
      <div v-else class="text-gray-500">暂无结果</div>
    </div>

    <div class="mb-4">
      <h2 class="text-lg font-semibold mb-2">原始数据</h2>
      <pre class="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60">{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDictionaryStore } from '@/stores/dictionaryStore'
import { LocalDictionaryAdapter } from '@/adapters/local'
import { LocalDictionaryRenderer } from '@/adapters/local/components'
import type { DictionarySearchResult } from '@/types/dictionary'
import type { DictionaryEntry } from '@/types'

const dictionaryStore = useDictionaryStore()
const localAdapter = new LocalDictionaryAdapter()

const testQuery = ref('hello')
const loading = ref(false)
const error = ref('')
const result = ref<DictionarySearchResult<DictionaryEntry> | null>(null)

const testSearch = async () => {
  if (!testQuery.value.trim()) return
  
  loading.value = true
  error.value = ''
  result.value = null
  
  try {
    console.log('开始测试搜索:', testQuery.value)
    const searchResult = await localAdapter.search(testQuery.value.trim())
    console.log('搜索结果:', searchResult)
    result.value = searchResult
  } catch (err) {
    console.error('搜索失败:', err)
    error.value = err instanceof Error ? err.message : '搜索失败'
  } finally {
    loading.value = false
  }
}

const handleWordClick = (word: DictionaryEntry) => {
  console.log('单词点击:', word)
}

const handleExampleClick = (example: any) => {
  console.log('例句点击:', example)
}

// 初始化时加载词典
dictionaryStore.loadDictionary()
</script>

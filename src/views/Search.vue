<script setup lang="ts">
import type { DictionaryEntry } from '@/types'
import WordDisplay from '@/components/dictionary/WordDisplay.vue'
import { useDictionaryStore } from '@/stores/dictionaryStore'
import { Message } from '@arco-design/web-vue'
import { onMounted, ref } from 'vue'

const searchQuery = ref('')
const loading = ref(false)
const dictionaryStore = useDictionaryStore()
const searchResult = ref<DictionaryEntry | null>(null)
const recentSearches = ref<DictionaryEntry[]>([])
const searchInputRef = ref<HTMLInputElement | null>(null)
const animationKey = ref(0) // 用于触发搜索结果的动画

onMounted(() => {
  try {
    const savedSearches = localStorage.getItem('recent-searches')
    if (savedSearches) {
      const wordList = JSON.parse(savedSearches) as string[]
      recentSearches.value = wordList
        .map(word => dictionaryStore.getWordByName(word))
        .filter(entry => entry) as DictionaryEntry[]
    }

    const urlParams = new URLSearchParams(window.location.search)
    const queryParam = urlParams.get('q')
    if (queryParam) {
      searchQuery.value = queryParam
      searchWord()
    }
  }
  catch (error) {
    console.error('加载最近搜索记录失败:', error)
  }
})

async function searchWord() {
  if (!searchQuery.value.trim()) {
    Message.warning('请输入要查询的单词')
    return
  }

  loading.value = true
  try {
    const result = dictionaryStore.searchWord(searchQuery.value.trim())

    if (result) {
      // 更新搜索结果并触发动画
      searchResult.value = result
      animationKey.value += 1 // 通过 key 变化触发动画

      // 添加到最近搜索
      addToRecentSearches(result)
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

function addToRecentSearches(word: DictionaryEntry) {
  // 移除已存在的相同单词
  recentSearches.value = recentSearches.value.filter(item => item.word !== word.word)

  // 添加到最前面
  recentSearches.value.unshift({ ...word })

  // 限制数量
  recentSearches.value = recentSearches.value.slice(0, 10)

  // 保存到本地存储
  const wordList = recentSearches.value.map(item => item.word)
  localStorage.setItem('recent-searches', JSON.stringify(wordList))
}

function updateUrlQuery(query: string) {
  const url = new URL(window.location.href)
  if (query) {
    url.searchParams.set('q', query)
  }
  else {
    url.searchParams.delete('q')
  }
  window.history.pushState({}, '', url)
}

function focusSearchInput() {
  if (searchInputRef.value) {
    searchInputRef.value.focus()
  }
}

function handleRecentSearch(word: DictionaryEntry) {
  searchQuery.value = word.word
  searchWord()
}
</script>

<template>
  <div class="max-w-2xl">
    <div class="flex flex-col items-start">
      <div class="relative w-full">
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索单词..."
          @click="focusSearchInput"
          @keyup.enter="searchWord"
        >
      </div>

      <div class="relative mt-6 min-h-[200px] w-full">
        <transition name="fade" mode="out-in">
          <div v-if="searchResult" :key="animationKey">
            <WordDisplay
              :word="searchResult"
              mode="normal"
              class="border border-gray-200 rounded-xl bg-white/10 p-6 shadow-sm backdrop-blur-sm"
            />
          </div>
        </transition>
      </div>

      <div v-if="recentSearches.length" class="mt-8 w-full">
        <h3 class="mb-4 text-base text-gray-500 font-medium">
          最近搜索
        </h3>
        <div class="flex flex-col gap-3">
          <transition-group name="list" tag="div">
            <WordDisplay
              v-for="word in recentSearches"
              :key="word.word"
              :word="word"
              mode="mini"
              clickable
              class="w-full"
              @click="handleRecentSearch(word)"
            />
          </transition-group>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-input {
  width: 100%;
  border-radius: 0.75rem;
  border: none;
  background-color: rgb(255 255 255 / 0.1);
  padding: 1rem;
  font-size: 1.125rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  outline: none;
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.search-input:focus,
.search-input:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.search-input:focus {
  border-color: rgb(209 213 219);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

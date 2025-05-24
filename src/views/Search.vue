<script setup lang="ts">
import type { DictionaryEntry } from '@/types'
import WordDisplay from '@/components/word/WordDisplay.vue'
import { useDictionaryStore } from '@/stores/dictionaryStore'
import { Message } from '@/utils/message'
import { Skeleton, SkeletonLine, Space } from '@/components/ui'
import { onMounted, ref, watch, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const searchQuery = ref('')
const loading = ref(false)
const dbLoading = ref(true) // 数据库加载状态
const dictionaryStore = useDictionaryStore()
const searchResult = ref<DictionaryEntry | null>(null)
const recentSearches = ref<DictionaryEntry[]>([])
const searchInputRef = ref<HTMLInputElement | null>(null)
const animationKey = ref(0) // 用于触发搜索结果的动画
const route = useRoute()
const router = useRouter()

// 监听URL参数变化
watch(
  () => route.query.q,
  async (newQuery) => {
    if (newQuery && typeof newQuery === 'string' && newQuery !== searchQuery.value) {
      searchQuery.value = newQuery
      // 确保数据库已加载
      if (!dictionaryStore.isLoaded) {
        await loadDictionary()
      }
      await searchWord()
    }
  }
)

// 加载数据库
async function loadDictionary() {
  if (!dictionaryStore.isLoaded) {
    dbLoading.value = true
    try {
      await dictionaryStore.loadDictionary()
    } catch (error) {
      console.error('加载字典失败:', error)
      Message.error('加载字典失败，请刷新页面重试')
    } finally {
      dbLoading.value = false
    }
  } else {
    dbLoading.value = false
  }
}

onMounted(async () => {
  // 加载数据库
  await loadDictionary()

  try {
    // 加载最近搜索
    const savedSearches = localStorage.getItem('recent-searches')
    if (savedSearches) {
      const wordList = JSON.parse(savedSearches) as string[]
      recentSearches.value = wordList
        .map(word => dictionaryStore.getWordByName(word))
        .filter(entry => entry) as DictionaryEntry[]
    }

    // 处理URL参数
    const urlParams = new URLSearchParams(window.location.search)
    const queryParam = urlParams.get('q')
    if (queryParam) {
      searchQuery.value = queryParam
      await searchWord()
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

  // 如果数据库未加载完成，等待加载
  if (!dictionaryStore.isLoaded) {
    await loadDictionary()
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
  router.replace({ query: { q: query } }).catch(() => {})
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
        <button
          class="search-button"
          @click="searchWord"
          :disabled="loading || dbLoading"
        >
          <div v-if="loading || dbLoading" class="loading-icon"></div>
          <div v-else class="i-carbon:search w-5 h-5"></div>
        </button>
      </div>

      <div class="relative mt-6 min-h-[200px] w-full">
        <!-- 数据库加载中骨架屏 -->
        <Skeleton v-if="dbLoading" :loading="true" class="skeleton-card">
          <Space direction="vertical" :style="{ width: '100%' }" size="large">
            <SkeletonLine :rows="1" :width="['40%']" />
            <SkeletonLine :rows="1" :width="['25%']" />
            <SkeletonLine :rows="2" :width="['100%', '70%']" />
          </Space>
        </Skeleton>
        
        <!-- 搜索加载中 -->
        <Skeleton v-else-if="loading" :loading="true" class="skeleton-card">
          <Space direction="vertical" :style="{ width: '100%' }" size="large">
            <SkeletonLine :rows="1" :width="['40%']" />
            <SkeletonLine :rows="1" :width="['25%']" />
            <SkeletonLine :rows="2" :width="['100%', '70%']" />
          </Space>
        </Skeleton>
        
        <!-- 搜索结果 -->
        <transition name="fade" mode="out-in">
          <div v-if="searchResult && !loading && !dbLoading" :key="animationKey">
            <WordDisplay
              :word="searchResult"
              mode="normal"
              class="border border-gray-200 rounded-xl bg-white/10 p-6 shadow-sm backdrop-blur-sm"
            />
          </div>
        </transition>
      </div>

      <div v-if="recentSearches.length && !dbLoading" class="mt-8 w-full">
        <h3 class="mb-4 text-base text-gray-500 font-medium">
          最近搜索
        </h3>
        <div class="flex flex-col gap-3">
          <Skeleton v-if="dbLoading" :loading="true" :animation="true" :count="3" />
          <transition-group v-else name="list" tag="div">
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
  padding-right: 3rem;
  /* 为按钮留空间 */
  font-size: 1.125rem;
  box-shadow: 0 1px 1px 0 rgb(0 0 0 / 0.05);
  outline: none;
  backdrop-filter: blur(2px);
  transition: all 0.3s ease;
}

.search-button {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.05);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.search-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.search-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-icon {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.search-input:focus,
.search-input:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.search-input:focus {
  border-color: rgb(209 213 219);
}

/* 骨架屏容器样式 */
.skeleton-card {
  border-radius: 12px;
  padding: 1.5rem;
  background-color: rgb(255 255 255 / 0.1);
  backdrop-filter: blur(2px);
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  width: 100%;
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

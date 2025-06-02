<script setup lang="ts">
import type { DictionaryEntry } from '@/types'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EmptyDictionaryGuide from '@/components/dictionary/EmptyDictionaryGuide.vue'
import { NSkeleton, NSpace } from 'naive-ui' // 替换为naive-ui组件
import WordDisplay from '@/components/word/WordDisplay.vue'
import OnlineDictionary from '@/components/dictionary/OnlineDictionary.vue'
import { useDictionaryStore } from '@/stores/dictionaryStore'
import { Message } from '@/utils/message'

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
const activeTab = ref<'local' | 'online'>('local')
// 追踪搜索历史展开状态
const showHistory = ref(false)

// 监听URL参数变化
watch(
  () => route.query.q,
  async newQuery => {
    if (newQuery && typeof newQuery === 'string' && newQuery !== searchQuery.value) {
      searchQuery.value = newQuery
      // 确保数据库已加载
      if (!dictionaryStore.isLoaded) {
        await loadDictionary()
      }
      await searchWord()
    }
  },
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
  } catch (error) {
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
    } else {
      Message.info('本地词典中未找到该单词')
    }
  } catch (error) {
    console.error('Error searching word:', error)
    Message.error('查询单词时出错')
  } finally {
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

// 切换 Tab
function toggleTab() {
  activeTab.value = activeTab.value === 'local' ? 'online' : 'local'
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-6 space-y-5">
    <!-- 搜索区域 -->
    <div class="space-y-4">
      <!-- 搜索框 -->
      <div class="flex gap-2">
        <div class="flex-1 relative">
          <div
            class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400/80 dark:text-gray-500/80"
          >
            <div
              i-carbon-search
              text-lg
            />
          </div>
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            class="w-full h-12 pl-10 pr-4 text-base rounded-lg bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm border border-gray-200/80 dark:border-dark-700/80 shadow-sm hover:bg-white dark:hover:bg-dark-700 focus:(ring-2 ring-primary-500/30 border-primary-500) outline-none transition duration-200"
            placeholder="搜索单词..."
            @keyup.enter="searchWord"
          />
        </div>
        <button
          class="h-12 px-5 rounded-lg bg-primary text-white font-medium shadow-sm hover:bg-primary-600 active:bg-primary-700 transition duration-200"
          @click="searchWord"
        >
          <div i-carbon-search />
        </button>
      </div>

      <!-- 标签页切换 -->
      <div class="flex rounded-lg bg-gray-100/80 dark:bg-dark-800/80 p-1">
        <button
          class="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-md font-medium transition duration-200"
          :class="[
            activeTab === 'local'
              ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-dark-700/50',
          ]"
          @click="activeTab = 'local'"
        >
          <div i-carbon-book />
          本地词典
        </button>
        <button
          class="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-md font-medium transition duration-200"
          :class="[
            activeTab === 'online'
              ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-dark-700/50',
          ]"
          @click="activeTab = 'online'"
        >
          <div i-carbon-cloud />
          在线词典
        </button>
      </div>
    </div>

    <!-- 最近搜索历史 -->
    <div
      v-if="recentSearches.length > 0"
      class="rounded-lg bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm shadow-sm border border-gray-100/80 dark:border-dark-700/80 overflow-hidden"
    >
      <div
        class="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700/50 transition duration-200"
        @click="showHistory = !showHistory"
      >
        <div class="flex items-center gap-1.5 text-sm font-medium">
          <div
            i-carbon-time
            class="text-primary-500/80"
          />
          最近搜索
        </div>
        <div
          i-carbon-chevron-down
          class="text-gray-400 dark:text-gray-500 transition duration-200"
          :class="showHistory ? 'rotate-180' : ''"
        />
      </div>
      <div
        v-show="showHistory"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-3 border-t border-gray-100/80 dark:border-dark-700/80"
      >
        <button
          v-for="word in recentSearches"
          :key="word.word"
          class="px-3 py-2 rounded-md bg-gray-50 dark:bg-dark-700/50 hover:bg-gray-100 dark:hover:bg-dark-600/50 text-sm text-left truncate transition duration-200"
          @click="handleRecentSearch(word)"
        >
          {{ word.word }}
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div
      v-if="dbLoading || loading"
      class="pt-2"
    >
      <NSkeleton
        class="w-full p-5 rounded-lg bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm shadow-sm"
      >
        <NSpace vertical>
          <div class="h-8 w-2/3 rounded bg-gray-100 dark:bg-dark-700/80 animate-pulse" />
          <div class="h-20 w-full rounded bg-gray-100 dark:bg-dark-700/80 animate-pulse" />
          <div class="h-12 w-4/5 rounded bg-gray-100 dark:bg-dark-700/80 animate-pulse" />
        </NSpace>
      </NSkeleton>
    </div>

    <!-- 空词典提示 -->
    <EmptyDictionaryGuide
      v-else-if="!dictionaryStore.isLoaded && !loading"
      class="mt-6 p-5 rounded-lg bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm shadow-sm"
    />

    <!-- 搜索结果 -->
    <div
      v-else
      class="pt-2"
    >
      <transition
        name="fade-slide"
        mode="out-in"
        :key="animationKey"
      >
        <template v-if="activeTab === 'local'">
          <WordDisplay
            v-if="searchResult"
            :word="searchResult"
            class="p-5 rounded-lg bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm shadow-sm border border-gray-100/80 dark:border-dark-700/80"
          />
          <div
            v-else-if="!loading && searchQuery"
            class="flex flex-col items-center justify-center py-12 rounded-lg bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm shadow-sm"
          >
            <div
              i-carbon-search-locate
              text-4xl
              mb-4
              class="text-gray-400 dark:text-gray-500"
            />
            <p class="text-base text-gray-500 dark:text-gray-400">未找到相关单词</p>
          </div>
        </template>
        <OnlineDictionary
          v-else-if="activeTab === 'online'"
          :query="searchQuery"
          class="p-5 rounded-lg bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm shadow-sm border border-gray-100/80 dark:border-dark-700/80"
        />
      </transition>
    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>

<script setup lang="ts">
import type { DictionaryEntry } from '@/types'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EmptyDictionaryGuide from '@/components/dictionary/EmptyDictionaryGuide.vue'
import { Skeleton, SkeletonLine, Space } from '@/components/ui' // 假设这些组件支持 class 传递
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
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-6 font-sans text-gray-800 dark:text-gray-100">
    <div class="space-y-4">
      <div class="flex gap-3">
        <div class="flex-1 relative group">
          <div
            class="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 dark:text-gray-500"
          >
            <div
              i-carbon-search
              text-xl
            />
          </div>
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            class="w-full pl-12 pr-6 py-3.5 text-lg rounded-2xl bg-white/40 dark:bg-dark-800/40 backdrop-blur-md border border-gray-200 dark:border-dark-700 shadow-xl shadow-gray-200/20 dark:shadow-black/20 hover:bg-white/60 dark:hover:bg-dark-700/60 focus:(bg-white dark:bg-dark-900 border-primary-500 ring-4 ring-primary-500/15) outline-none transition-all duration-300 ease-in-out"
            :placeholder="'搜索单词...'"
            @keyup.enter="searchWord"
          />
        </div>
        <button
          class="px-7 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-lg font-semibold shadow-lg shadow-primary-500/30 hover:from-primary-600 hover:to-primary-700 active:scale-98 transition-all duration-300 ease-out transform"
          @click="searchWord"
        >
          <div
            i-carbon-search
            text-xl
          />
        </button>
      </div>

      <div
        class="flex p-1.5 gap-2 rounded-2xl bg-white/30 dark:bg-dark-800/30 backdrop-blur-md shadow-inner shadow-gray-200/20 dark:shadow-black/20"
      >
        <button
          class="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-base font-medium transition-all duration-300 ease-in-out transform hover:scale-102 active:scale-98"
          :class="[
            activeTab === 'local'
              ? 'text-primary-700 dark:text-primary-300 bg-white dark:bg-dark-700 shadow-md shadow-gray-300/30 dark:shadow-black/30'
              : 'text-gray-600 dark:text-gray-400 hover:(text-primary-600 dark:text-primary-400 bg-white/50 dark:bg-dark-700/50)',
          ]"
          @click="activeTab = 'local'"
        >
          <div
            i-carbon-book
            text-lg
          />
          本地词典
        </button>
        <button
          class="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-base font-medium transition-all duration-300 ease-in-out transform hover:scale-102 active:scale-98"
          :class="[
            activeTab === 'online'
              ? 'text-primary-700 dark:text-primary-300 bg-white dark:bg-dark-700 shadow-md shadow-gray-300/30 dark:shadow-black/30'
              : 'text-gray-600 dark:text-gray-400 hover:(text-primary-600 dark:text-primary-400 bg-white/50 dark:bg-dark-700/50)',
          ]"
          @click="activeTab = 'online'"
        >
          <div
            i-carbon-cloud
            text-lg
          />
          在线词典
        </button>
      </div>
    </div>

    <div
      v-if="recentSearches.length > 0"
      class="rounded-2xl overflow-hidden bg-white/30 dark:bg-dark-800/30 backdrop-blur-md shadow-xl shadow-gray-200/20 dark:shadow-black/20"
    >
      <div
        class="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-white/50 dark:hover:bg-dark-700/50 transition-colors duration-200 ease-out"
        @click="showHistory = !showHistory"
      >
        <div class="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-200">
          <div
            i-carbon-time
            class="text-primary-500 op-75"
          />
          最近搜索
        </div>
        <div
          i-carbon-chevron-down
          class="text-lg op-60 transition-transform duration-300 ease-out"
          :class="showHistory ? 'rotate-180' : ''"
        />
      </div>
      <div
        v-show="showHistory"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 p-4 border-t border-gray-200/50 dark:border-dark-700/50"
      >
        <button
          v-for="word in recentSearches"
          :key="word.name"
          class="px-4 py-2 rounded-lg text-sm text-left truncate bg-gray-100/60 dark:bg-dark-700/60 hover:(bg-gray-200/80 dark:bg-dark-600/80) transition-colors duration-200 ease-out shadow-sm transform hover:scale-102 active:scale-98"
          @click="
            () => {
              searchQuery = word.name
              searchWord()
            }
          "
        >
          {{ word.name }}
        </button>
      </div>
    </div>

    <div
      v-if="dbLoading || loading"
      class="pt-4"
    >
      <Skeleton
        class="w-full p-6 rounded-2xl bg-white/30 dark:bg-dark-800/30 backdrop-blur-md shadow-xl shadow-gray-200/20 dark:shadow-black/20"
      >
        <Space vertical>
          <div class="h-10 w-2/3 rounded-lg bg-gray-200 dark:bg-dark-700 animate-pulse" />
          <div class="h-24 w-full rounded-lg bg-gray-200 dark:bg-dark-700 animate-pulse" />
          <div class="h-14 w-4/5 rounded-lg bg-gray-200 dark:bg-dark-700 animate-pulse" />
        </Space>
      </Skeleton>
    </div>

    <EmptyDictionaryGuide
      v-else-if="!dictionaryStore.isLoaded && !loading"
      class="mt-8 p-6 rounded-2xl bg-white/30 dark:bg-dark-800/30 backdrop-blur-md shadow-xl shadow-gray-200/20 dark:shadow-black/20"
    />

    <div
      v-else
      class="pt-4"
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
            class="p-6 rounded-2xl bg-white/30 dark:bg-dark-800/30 backdrop-blur-md shadow-xl shadow-gray-200/20 dark:shadow-black/20"
          />
          <div
            v-else-if="!loading && searchQuery"
            class="flex flex-col items-center justify-center py-16 text-gray-500 bg-white/30 dark:bg-dark-800/30 rounded-2xl shadow-xl backdrop-blur-md"
          >
            <div
              i-carbon-search-locate
              text-5xl
              mb-6
            />
            <p class="text-lg font-medium">未找到相关单词</p>
          </div>
        </template>
        <OnlineDictionary
          v-else-if="activeTab === 'online'"
          :query="searchQuery"
          class="p-6 rounded-2xl bg-white/30 dark:bg-dark-800/30 backdrop-blur-md shadow-xl shadow-gray-200/20 dark:shadow-black/20"
        />
      </transition>
    </div>
  </div>
</template>

<style scoped>
/* 定义淡入滑出动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.4s ease-out,
    transform 0.4s ease-out;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px); /* 新元素从下方进入 */
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px); /* 旧元素向上方离开 */
}
</style>

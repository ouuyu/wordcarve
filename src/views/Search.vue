<script setup lang="ts">
import type { DictionaryEntry } from '@/types'
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
const previousResult = ref<DictionaryEntry | null>(null)
const recentSearches = ref<DictionaryEntry[]>([])
const searchInputRef = ref<HTMLInputElement | null>(null)

// 动画状态
const currentCardState = ref<'entering' | 'leaving' | null>(null)
const newCardState = ref<'entering' | 'leaving' | null>(null)
const isAnimating = ref(false)

async function searchWord() {
  if (!searchQuery.value.trim()) {
    Message.warning('请输入要查询的单词')
    return
  }

  loading.value = true
  try {
    const result = dictionaryStore.searchWord(searchQuery.value.trim())

    // 如果有新的搜索结果，且与当前结果不同，则触发动画
    if (result && searchResult.value && result.word !== searchResult.value.word) {
      isAnimating.value = true

      // 当前卡片开始离开动画
      currentCardState.value = 'leaving'

      // 保存当前结果为上一个结果
      previousResult.value = searchResult.value

      // 设置新结果
      searchResult.value = result
    }
    else {
      // 首次搜索或相同单词，直接显示结果
      searchResult.value = result

      if (result) {
        // 添加到历史记录
        addToRecentSearches(result)
      }
    }

    if (result) {
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

// 当前卡片动画完成
function onCurrentCardAnimationComplete() {
  currentCardState.value = null

  // 当前卡片离开动画完成后，开始新卡片的进入动画
  if (previousResult.value) {
    // 将上一个结果添加到历史记录
    addToRecentSearches(previousResult.value)
    previousResult.value = null
  }

  // 开始新卡片的进入动画
  newCardState.value = 'entering'
}

// 新卡片动画完成
function onNewCardAnimationComplete() {
  newCardState.value = null
  isAnimating.value = false
}

// 添加到历史记录
function addToRecentSearches(word: DictionaryEntry) {
  const wordExists = recentSearches.value.some(item => item.word === word.word)
  if (!wordExists) {
    // 为新添加的历史记录项设置动画状态
    recentSearches.value.unshift({ ...word })
    recentSearches.value = recentSearches.value.slice(0, 10)

    // 保存历史记录
    const wordList = recentSearches.value.map(item => item.word)
    localStorage.setItem('recent-searches', JSON.stringify(wordList))
  }
}

// ... existing code ...
</script>

<template>
  <div class="max-w-2xl">
    <div class="flex flex-col items-start">
      <input
        ref="searchInputRef"
        v-model="searchQuery" type="text" class="w-full border border-gray-300 rounded-full bg-stone-100 px-6 py-3 text-lg text-gray-900 outline-none focus:border-gray-500 placeholder-gray-400"
        placeholder="搜索单词..."
        @click="focusSearchInput"
        @keyup.enter="searchWord"
      >

      <div v-if="loading" class="mt-6">
        <a-spin dot />
      </div>

      <!-- 搜索结果 -->
      <div class="relative mt-4 min-h-[200px] w-full py-4">
        <!-- 当前结果 -->
        <div v-if="searchResult" class="max-w-3xl w-full">
          <WordDisplay
            :word="searchResult"
            mode="normal"
            :animation-state="newCardState"
            class="border border-gray-100/20 rounded-lg bg-white/10 p-6 shadow-sm"
            @animation-complete="onNewCardAnimationComplete"
          />
        </div>

        <!-- 上一个结果（动画中） -->
        <div v-if="previousResult && currentCardState" class="absolute left-0 top-0 max-w-3xl w-full">
          <WordDisplay
            :word="previousResult"
            mode="normal"
            :animation-state="currentCardState"
            class="border border-gray-100/20 rounded-lg bg-white/10 p-6 shadow-sm"
            @animation-complete="onCurrentCardAnimationComplete"
          />
        </div>
      </div>

      <!-- 历史记录 - 使用 mini 模式 -->
      <div v-if="recentSearches.length" class="mt-6 w-full">
        <h3 class="mb-3 text-lg text-gray-700 font-medium">
          最近搜索
        </h3>
        <div class="flex flex-col gap-2">
          <WordDisplay
            v-for="(word, index) in recentSearches"
            :key="word.word"
            :word="word"
            mode="mini"
            clickable
            :animation-state="index === 0 && isAnimating ? 'entering' : null"
            class="transition-all hover:shadow-sm"
            @click="handleRecentSearch(word)"
          />
        </div>
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

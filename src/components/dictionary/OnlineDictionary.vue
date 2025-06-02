<script setup lang="ts">
import { ref, watch } from 'vue'
import { Message } from '@/utils/message'
import {
  NSpin,
  NSkeleton,
  NButton,
  NSpace,
  NCard,
  NEmpty,
  NResult,
  NDivider,
  NTag,
  NIcon,
  NBadge,
} from 'naive-ui'
import { playWordPronunciation, PronunciationType } from '@/utils/audio'
import { OnlineDictionaryEntry } from '@/types/dictionary'
import {
  queryWord,
  calculateFrequencyLevel,
  externalDictionaries,
  getTagDisplay,
} from '@/services/dictionary'
import OnlineDictEntry from '@/components/dictionary/onlineDict/OnlineDictEntry.vue'

const props = defineProps<{
  query: string
}>()

const loading = ref(false)
const wordData = ref<OnlineDictionaryEntry[]>([])
const error = ref<string | null>(null)
const retryCount = ref(0)
const maxRetries = 2

/**
 * 处理单词发音播放
 */
const handlePlayPronunciation = async (word: string, type: 'US' | 'UK') => {
  try {
    await playWordPronunciation(word, type as unknown as PronunciationType)
  } catch {
    Message.error('播放发音失败')
  }
}

/**
 * 打开外部词典
 */
const openExternalDictionary = (url: string, word: string) => {
  window.open(url + word, '_blank')
}

/**
 * 获取单词数据
 */
const fetchWordData = async (word: string) => {
  if (!word.trim()) return

  loading.value = true
  error.value = null

  try {
    const response = await queryWord(word)
    wordData.value = response
    retryCount.value = 0
  } catch (err) {
    console.error('获取单词释义失败:', err)

    // 处理具体错误信息
    if (err instanceof Error) {
      error.value = err.message || '获取单词释义失败'
    } else {
      error.value = '获取单词释义失败，请稍后重试'
    }

    Message.error(error.value)
    retryCount.value++

    if (retryCount.value < maxRetries) {
      setTimeout(() => fetchWordData(word), 1500 * retryCount.value)
    }
  } finally {
    loading.value = false
  }
}

/**
 * 重试搜索
 */
const retrySearch = () => {
  if (props.query) {
    fetchWordData(props.query)
  }
}

// 监听查询词变化
watch(
  () => props.query,
  newQuery => {
    if (newQuery) {
      fetchWordData(newQuery)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="dictionary-container">
    <!-- 加载状态 -->
    <NSpin
      v-if="loading"
      :show="true"
      description="正在查询中..."
      size="large"
    >
      <NCard class="dictionary-card">
        <NSkeleton
          text
          :repeat="5"
          :sharp="false"
          size="medium"
        />
      </NCard>
    </NSpin>

    <!-- 错误状态 -->
    <NCard
      v-else-if="error"
      class="dictionary-card"
    >
      <NResult
        status="error"
        title="查询失败"
        :description="error"
      >
        <template #footer>
          <NButton
            type="primary"
            secondary
            @click="retrySearch"
          >
            <template #icon>
              <div class="i-carbon-reset mr-1" />
            </template>
            重新尝试
          </NButton>
        </template>
      </NResult>
    </NCard>

    <!-- 词典结果 -->
    <div
      v-else-if="wordData.length > 0"
      class="dictionary-results"
    >
      <OnlineDictEntry
        v-for="(entry, index) in wordData"
        :key="index"
        :entry="entry"
        :frequency-level="calculateFrequencyLevel(entry.frequency)"
        :play-pronunciation="handlePlayPronunciation"
        :open-external-dictionary="openExternalDictionary"
      />
    </div>

    <!-- 无结果 -->
    <NCard
      v-else-if="!loading && query"
      class="dictionary-card"
    >
      <NEmpty
        description="未找到相关单词"
        size="large"
      >
        <template #icon>
          <div class="i-carbon-search-locate text-4xl text-gray-400" />
        </template>
        <template #extra>
          <p class="mb-3 text-sm text-gray-500">可以尝试在以下词典查找</p>
          <NSpace class="external-dictionaries">
            <NButton
              v-for="dict in externalDictionaries"
              :key="dict.name"
              size="small"
              secondary
              @click="openExternalDictionary(dict.url, query)"
            >
              <div
                :class="dict.icon"
                class="mr-1"
              />
              {{ dict.name }}
            </NButton>
          </NSpace>
        </template>
      </NEmpty>
    </NCard>
  </div>
</template>

<style scoped>
.dictionary-container {
  width: 100%;
}

.dictionary-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.dictionary-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.dictionary-results {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.external-dictionaries {
  justify-content: center;
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NEmpty, NAlert, NSpin, NSpace, NIcon, NText, NButton } from 'naive-ui'
import OnlineDictEntry from './OnlineDictEntry.vue'
import { playWordPronunciation, PronunciationType } from '@/utils/audio'
import { Message } from '@/utils/message'
import { calculateFrequencyLevel, externalDictionaries } from '@/services/dictionary'
import type { DictionarySearchResult, OnlineDictionaryEntry } from '@/types/dictionary'

interface Props {
  result?: DictionarySearchResult<OnlineDictionaryEntry>
  error?: string
  loading?: boolean
  query?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  retry: []
}>()

// 计算属性
const hasEntries = computed(() => props.result?.entries && props.result.entries.length > 0)

// 方法
const handlePlayPronunciation = async (word: string, type: 'US' | 'UK') => {
  try {
    await playWordPronunciation(word, type as unknown as PronunciationType)
  } catch {
    Message.error('播放发音失败')
  }
}

const handleRetry = () => {
  emit('retry')
}
</script>

<template>
  <div class="w-full min-h-400px">
    <div
      v-if="loading"
      class="flex justify-center items-center min-h-200px"
    >
      <NSpin size="large">
        <template #description>
          <div class="mt-16px text-theme-7 text-16px dark:text-theme-3">正在搜索在线词典...</div>
        </template>
      </NSpin>
    </div>

    <div
      v-else-if="error"
      class="mb-16px"
    >
      <NAlert
        type="error"
        title="在线词典搜索失败"
        class="rd-xl border-0 shadow-lg"
      >
        {{ error }}

        <NButton
          size="small"
          type="error"
          secondary
          @click="handleRetry"
          class="rd-lg mt-4"
        >
          <template #icon>
            <NIcon>
              <div class="i-carbon-reset" />
            </NIcon>
          </template>
          重试
        </NButton>
      </NAlert>
    </div>

    <div
      v-else-if="!hasEntries && query && !loading"
      class="flex justify-center items-center min-h-400px p-20px"
    >
      <NCard
        class="result-card rd-xl border-0 shadow-lg bg-theme-1/60 backdrop-blur-xl text-center w-full max-w-500px py-12"
      >
        <NEmpty
          description="在线词典未找到相关结果"
          size="large"
          class="py-12"
        >
          <template #icon>
            <NIcon
              size="48"
              class="text-theme-5"
            >
              <div class="i-carbon-cloud-offline" />
            </NIcon>
          </template>

          <template #extra>
            <NSpace
              vertical
              align="center"
              class="mt-6"
            >
              <NText
                depth="3"
                class="text-sm text-theme-7"
              >
                可以尝试在以下词典查找
              </NText>
              <NSpace>
                <NButton
                  v-for="dict in externalDictionaries"
                  :key="dict.name"
                  size="small"
                  secondary
                  @click="openExternalDictionary(dict.url, query!)"
                  class="rd-lg"
                >
                  <template #icon>
                    <NIcon>
                      <div :class="dict.icon" />
                    </NIcon>
                  </template>
                  {{ dict.name }}
                </NButton>
              </NSpace>
            </NSpace>
          </template>
        </NEmpty>
      </NCard>
    </div>

    <div
      v-else-if="hasEntries"
      class="space-y-4"
    >
      <div>
        <div
          v-for="(entry, index) in result!.entries"
          :key="`${entry.headword}-${index}`"
          class="animate-slide-in-up"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <OnlineDictEntry
            :entry="entry"
            :frequency-level="calculateFrequencyLevel(entry.frequency)"
            :play-pronunciation="handlePlayPronunciation"
            :open-external-dictionary="openExternalDictionary"
          />
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex justify-center items-center min-h-400px p-20px"
    >
      <NCard
        class="result-card rd-xl border-0 shadow-lg bg-theme-1/60 backdrop-blur-xl text-center w-full max-w-500px py-12"
      >
        <NEmpty
          description="输入单词开始在线搜索"
          size="large"
          class="py-12"
        >
          <template #icon>
            <NIcon
              size="48"
              class="text-theme-6"
            >
              <div class="i-carbon-cloud" />
            </NIcon>
          </template>

          <template #extra>
            <NText
              depth="3"
              class="text-sm text-theme-7 mt-4"
            >
              在线词典提供最新的词汇释义
            </NText>
          </template>
        </NEmpty>
      </NCard>
    </div>
  </div>
</template>

<style scoped>
/* 结果卡片动画和暗模式 */
.result-card {
  transition: all 0.3s ease;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.dark .result-card {
  background: var(--theme-9) !important;
  opacity: 0.8 !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
}

/* 词典条目动画 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in-up {
  animation: slideInUp 0.6s ease-out forwards;
}

@media (max-width: 768px) {
  .result-card {
    border-radius: 12px;
    margin: 0 -8px;
  }
}
</style>

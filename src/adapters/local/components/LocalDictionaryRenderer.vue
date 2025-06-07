<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NEmpty, NButton, NSkeleton, NSpace, NIcon, NText, NAlert } from 'naive-ui'
import type { DictionaryEntry } from '@/types'
import type { DictionarySearchResult } from '@/types/dictionary'
import WordDisplay from './WordDisplay.vue'

const props = defineProps<{
  result?: DictionarySearchResult<DictionaryEntry> // 搜索结果
  error?: string // 错误信息
  loading?: boolean // 加载状态
  query?: string // 查询词
}>()

const emit = defineEmits<{
  retry: [] // 重试事件
  'word-click': [word: DictionaryEntry] // 单词点击事件
  'example-click': [example: any] // 例句点击事件
}>()

const hasResults = computed(() => {
  console.log('LocalDictionaryRenderer - hasResults check:', {
    result: props.result,
    entries: props.result?.entries,
    entriesLength: props.result?.entries?.length,
    hasResult: !!(props.result && props.result.entries && props.result.entries.length > 0),
  })
  return !!(props.result && props.result.entries && props.result.entries.length > 0)
})

const handleRetry = () => {
  emit('retry')
}

const handleWordClick = (word: DictionaryEntry) => {
  emit('word-click', word)
}

const handleExampleClick = (example: any) => {
  emit('example-click', example)
}
</script>

<template>
  <div class="w-full min-h-400px">
    <div
      v-if="loading"
      class="w-full"
    >
      <NCard
        class="rounded-2xl border-0 shadow-xl bg-theme-1/65 backdrop-blur-xl transition-all duration-300"
      >
        <div class="space-y-4 p-6">
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 rounded-full bg-green-100 animate-pulse" />
            <NSkeleton
              width="150px"
              height="20px"
              class="rounded-lg"
            />
          </div>
          <NSkeleton
            width="80px"
            height="14px"
            class="rounded-md"
          />
          <div class="mt-6 space-y-2">
            <NSkeleton
              text
              :repeat="3"
              :sharp="false"
              size="medium"
              class="rounded-md"
            />
          </div>
        </div>
      </NCard>
    </div>

    <div v-else-if="error">
      <NAlert
        type="error"
        title="本地词典搜索失败"
        class="rounded-xl border-none shadow-lg"
      >
        {{ error }}
        <template>
          <NButton
            size="small"
            type="error"
            secondary
            @click="handleRetry"
            class="rounded-lg mt-4"
          >
            <template #icon>
              <NIcon>
                <div class="i-carbon-reset" />
              </NIcon>
            </template>
            重试
          </NButton>
        </template>
      </NAlert>
    </div>

    <div
      v-if="hasResults"
      class="space-y-4"
    >
      <div class="space-y-3">
        <div
          v-for="(entry, index) in result?.entries || []"
          :key="`${entry.word}-${index}`"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <NCard class="rounded-xl border-0 shadow-md bg-theme-1/60 backdrop-blur-lg">
            <WordDisplay
              :word="entry"
              mode="normal"
              @word-click="handleWordClick"
              @example-click="handleExampleClick"
            />
          </NCard>
        </div>
      </div>
    </div>

    <div v-else-if="query && !loading">
      <NCard class="rounded-xl border-0 shadow-lg bg-theme-1/60 backdrop-blur-xl text-center">
        <NEmpty
          description="本地词典未找到相关结果"
          size="large"
          class="py-12"
        >
          <template #icon>
            <NIcon
              size="48"
              class="text-gray-300"
            >
              <div class="i-carbon-data-base-alt" />
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
                class="text-sm text-gray-500"
              >
                词典中没有此单词，尝试在线搜索
              </NText>
              <NButton
                type="primary"
                secondary
                @click="handleRetry"
                class="rounded-lg"
              >
                <template #icon>
                  <NIcon>
                    <div class="i-carbon-reset" />
                  </NIcon>
                </template>
                重新搜索
              </NButton>
            </NSpace>
          </template>
        </NEmpty>
      </NCard>
    </div>

    <div v-else>
      <NCard class="rounded-xl border-0 shadow-lg bg-theme-1/60 backdrop-blur-xl text-center">
        <NEmpty
          description="输入单词开始本地搜索"
          size="large"
          class="py-12"
        >
          <template #icon>
            <NIcon
              size="48"
              class="text-theme-6"
            >
              <div class="i-carbon-data-base" />
            </NIcon>
          </template>

          <template #extra>
            <NText
              depth="3"
              class="text-sm text-theme-7 mt-4"
            >
              本地词典提供快速离线查询
            </NText>
          </template>
        </NEmpty>
      </NCard>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  .n-card {
    border-radius: 12px;
    margin: 0 -8px;
  }

  .bg-gradient-to-r {
    margin: 0 -8px 16px;
    border-radius: 8px;
  }

  .n-empty {
    padding: 32px 16px;
  }
}
</style>

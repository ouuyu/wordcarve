<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NEmpty, NAlert, NSpin, NSpace, NIcon, NText, NButton } from 'naive-ui'
import CambridgeDictEntry from './CambridgeDictEntry.vue'
import { playWordPronunciation, PronunciationType } from '@/utils/audio'
import { Message } from '@/utils/message'
import type { DictionarySearchResult, CambridgeDictionaryEntry } from '@/types/dictionary'

interface Props {
  result?: DictionarySearchResult<CambridgeDictionaryEntry>
  error?: string
  loading?: boolean
  query?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  retry: []
}>()

const hasResults = computed(() => {
  return props.result?.entries && props.result.entries.length > 0
})

const handleOpenExternalDictionary = (url: string, word: string) => {
  const fullUrl = `${url}${encodeURIComponent(word)}`
  window.open(fullUrl, '_blank', 'noopener,noreferrer')
}

const handleRetry = () => {
  emit('retry')
}
</script>

<template>
  <div class="cambridge-dictionary-renderer">
    <!-- 加载状态 -->
    <div
      v-if="loading"
      class="flex justify-center py-8"
    >
      <NSpin size="large">
        <template #description>
          <NText depth="3">正在查询 Cambridge 词典...</NText>
        </template>
      </NSpin>
    </div>

    <!-- 错误状态 -->
    <NAlert
      v-else-if="error"
      type="error"
      class="mb-4"
      :show-icon="true"
    >
      <template #header>
        <div class="flex items-center gap-2">
          <NIcon>
            <div class="i-carbon-warning" />
          </NIcon>
          Cambridge 词典查询失败
        </div>
      </template>

      <div class="space-y-2">
        <NText>{{ error }}</NText>
        <div>
          <NButton
            size="small"
            type="primary"
            @click="handleRetry"
          >
            <template #icon>
              <div class="i-carbon-restart" />
            </template>
            重试
          </NButton>
        </div>
      </div>
    </NAlert>

    <!-- 无结果状态 -->
    <NCard
      v-else-if="!hasResults && !loading"
      class="border-0 shadow-lg bg-theme-1/60 backdrop-blur-xl"
    >
      <NEmpty
        description="未找到相关词条"
        class="py-8"
      >
        <template #icon>
          <div class="i-carbon-search text-4xl" />
        </template>

        <template #extra>
          <NSpace
            vertical
            align="center"
          >
            <NText
              depth="3"
              class="text-center"
            >
              在 Cambridge 英英词典中未找到 "{{ query }}" 的释义
            </NText>
            <NButton
              size="small"
              @click="handleRetry"
            >
              <template #icon>
                <div class="i-carbon-restart" />
              </template>
              重新搜索
            </NButton>
          </NSpace>
        </template>
      </NEmpty>
    </NCard>

    <!-- 结果展示 -->
    <div
      v-else-if="hasResults"
      class="space-y-4"
    >
      <!-- 词条列表 -->
      <div
        v-for="(entry, index) in result?.entries"
        :key="`${entry.word}-${index}`"
        class="cambridge-entry"
      >
        <CambridgeDictEntry :entry="entry" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.cambridge-dictionary-renderer {
  width: 100%;
}

.cambridge-entry {
  margin-bottom: 1rem;
}

.cambridge-entry:last-child {
  margin-bottom: 0;
}
</style>

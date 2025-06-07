<script setup lang="ts">
import { ref } from 'vue'
import { OnlineDictionaryEntry, ExternalDictionary } from '@/types/dictionary'
import { wordFormMapping, getTagDisplay } from '@/services/dictionary'
import { NCard, NTabs, NTabPane, NTag, NSpace, NButton, NDivider, NBadge, NTooltip } from 'naive-ui'
import FrequencyIndicator from '@/components/dictionary/FrequencyIndicator.vue'
import OnlineDictDefinitions from './OnlineDictDefinitions.vue'
import OnlineDictCollocations from './OnlineDictCollocations.vue'
import OnlineDictSynAnt from './OnlineDictSynAnt.vue'

const props = defineProps<{
  entry: OnlineDictionaryEntry
  frequencyLevel: number
  playPronunciation: (word: string, type: 'US' | 'UK') => void
  openExternalDictionary: (url: string, word: string) => void
}>()

const activeTab = ref<'definitions' | 'collocations' | 'synonyms'>('definitions')

const handlePlayPronunciation = (type: 'US' | 'UK', event?: Event) => {
  if (event) event.stopPropagation()
  props.playPronunciation(props.entry.headword, type)
}

const handleOpenExternalDictionary = (url: string) => {
  props.openExternalDictionary(url, props.entry.headword)
}
</script>

<template>
  <NCard
    class="dict-entry-card border-0 shadow-lg bg-theme-1/60 backdrop-blur-lg"
    hoverable
  >
    <!-- 单词头部信息 -->
    <div class="dict-header">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-xl font-bold text-theme-9">{{ entry.headword }}</h2>
        <div v-if="entry.frequency">
          <FrequencyIndicator :level="frequencyLevel" />
        </div>
      </div>

      <!-- 音标和发音 -->
      <NSpace
        class="mb-3"
        align="center"
        :size="12"
      >
        <NSpace
          v-if="entry.pronunciations?.UK"
          align="center"
          :size="6"
        >
          <NTag
            size="small"
            type="info"
            round
            >英</NTag
          >
          <span class="font-mono text-sm">/ {{ entry.pronunciations.UK }} /</span>
          <NTooltip>
            <template #trigger>
              <NButton
                quaternary
                circle
                size="small"
                @click="e => handlePlayPronunciation('UK', e)"
              >
                <div i-carbon-volume-up />
              </NButton>
            </template>
            播放英式发音
          </NTooltip>
        </NSpace>

        <NSpace
          v-if="entry.pronunciations?.US"
          align="center"
          :size="6"
        >
          <NTag
            size="small"
            type="error"
            round
            >美</NTag
          >
          <span class="font-mono text-sm">/ {{ entry.pronunciations.US }} /</span>
          <NTooltip>
            <template #trigger>
              <NButton
                quaternary
                circle
                size="small"
                @click="e => handlePlayPronunciation('US', e)"
              >
                <div i-carbon-volume-up />
              </NButton>
            </template>
            播放美式发音
          </NTooltip>
        </NSpace>
      </NSpace>

      <!-- 标签 -->
      <NSpace
        v-if="entry.tags && entry.tags.length > 0"
        :size="[8, 4]"
        wrap
      >
        <NTag
          v-for="tag in entry.tags"
          :key="tag"
          size="small"
          round
        >
          {{ getTagDisplay(tag) }}
        </NTag>
      </NSpace>

      <!-- 词形变化 -->
      <NSpace
        v-if="entry.wordForms && entry.wordForms.length > 0"
        class="my-2"
        wrap
        :size="[12, 8]"
      >
        <NSpace
          v-for="(form, i) in entry.wordForms"
          :key="i"
          :size="4"
          align="center"
        >
          <span class="text-xs text-theme-7"> {{ wordFormMapping[form.type] || form.type }}: </span>
          <span class="font-medium text-theme-9">{{ form.form }}</span>
        </NSpace>
      </NSpace>

      <NDivider class="my-3" />
    </div>

    <!-- 内容标签页 -->
    <NTabs
      v-model:value="activeTab"
      type="line"
      class="mt-4"
      animated
    >
      <NTabPane
        name="definitions"
        tab="释义与例句"
      >
        <OnlineDictDefinitions :entry="entry" />
      </NTabPane>

      <NTabPane
        v-if="entry.collocations?.length"
        name="collocations"
        tab="搭配"
      >
        <OnlineDictCollocations :collocations="entry.collocations" />
      </NTabPane>

      <NTabPane
        v-if="entry.synonyms?.length || entry.antonyms?.length"
        name="synonyms"
        tab="同反义词"
      >
        <OnlineDictSynAnt
          :synonyms="entry.synonyms"
          :antonyms="entry.antonyms"
        />
      </NTabPane>
    </NTabs>
  </NCard>
</template>

<style scoped>
.dict-entry-card {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.dict-header {
  padding-bottom: 8px;
}
</style>

<script setup lang="ts">
import { NCard, NTabs, NTabPane, NTag, NSpace, NButton, NDivider, NTooltip } from 'naive-ui'
import CambridgeDictDefinitions from './CambridgeDictDefinitions.vue'

const props = defineProps<{
  entry: CambridgeDictionaryEntry
}>()
</script>

<template>
  <NCard class="dict-entry-card">
    <!-- 词条头部 -->
    <div class="dict-header">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-3">
          <h2 class="text-2xl font-bold text-primary">
            {{ entry.word }}
          </h2>

          <!-- 词性标签 -->
          <NSpace v-if="entry.pos?.length">
            <NTag
              v-for="pos in entry.pos"
              :key="pos"
              size="small"
              type="info"
              :bordered="false"
            >
              {{ pos }}
            </NTag>
          </NSpace>
        </div>
      </div>
    </div>

    <NDivider class="!my-3" />

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
        <CambridgeDictDefinitions :entry="entry" />
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

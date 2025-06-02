<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NModal } from 'naive-ui'
import { Message } from '@/utils/message'
import { useDictionaryStore } from '@/stores/dictionaryStore'
import DictionaryCard from '@/components/settings/DictionaryCard.vue'
import DictionaryDownloader from '@/components/settings/DictionaryDownloader.vue'
import DictionaryUploader from '@/components/settings/DictionaryUploader.vue'

const dictionaryStore = useDictionaryStore()
const showDownloader = ref(false)
const showConfirm = ref(false)
const isMobile = computed(() => window.innerWidth < 768)

async function clearDictionary() {
  await dictionaryStore.clearDictionary()
  Message.success('字典已清空')
  showConfirm.value = false
}
</script>

<template>
  <div class="dictionary-manager">
    <div class="mb-6">
      <p class="mb-2 text-gray-600">当前词库: {{ dictionaryStore.dictionary.length }} 个单词</p>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3 sm:grid-cols-2">
      <!-- 导入字典 -->
      <DictionaryCard
        icon="i-carbon:upload"
        title="导入字典"
        description="从 JSON 文件导入"
      >
        <DictionaryUploader />
      </DictionaryCard>

      <!-- 下载字典 -->
      <DictionaryCard
        icon="i-carbon:download"
        title="下载字典"
        description="从网络下载预设词库"
      >
        <NButton
          ghost
          size="small"
          @click="showDownloader = true"
        >
          打开下载管理
        </NButton>
      </DictionaryCard>

      <!-- 清空字典 -->
      <DictionaryCard
        icon="i-carbon:trash-can"
        title="清空字典"
        description="删除所有词条"
      >
        <NButton
          ghost
          size="small"
          :disabled="!dictionaryStore.dictionary.length"
          @click="showConfirm = true"
        >
          清空词库
        </NButton>
      </DictionaryCard>
    </div>

    <!-- 字典下载弹出框 -->
    <NModal
      v-model:show="showDownloader"
      title="字典下载管理"
      preset="card"
      :mask-closable="true"
      :style="{ width: isMobile ? '95%' : '800px' }"
    >
      <DictionaryDownloader @close="showDownloader = false" />
    </NModal>

    <!-- 确认弹窗 -->
    <NModal
      v-model:show="showConfirm"
      title="确认操作"
      preset="dialog"
      positive-text="确认"
      negative-text="取消"
      @positive-click="clearDictionary"
      @negative-click="showConfirm = false"
    >
      <p>确定要清空字典吗？此操作不可撤销。</p>
    </NModal>
  </div>
</template>

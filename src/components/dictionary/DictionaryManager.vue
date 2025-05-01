<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { IconDelete, IconDownload, IconUpload } from '@arco-design/web-vue/es/icon'
import { computed, ref } from 'vue'
import { useDictionaryStore } from '../../stores/dictionaryStore'
import DictionaryCard from './DictionaryCard.vue'
import DictionaryDownloader from './DictionaryDownloader.vue'
import DictionaryUploader from './DictionaryUploader.vue'

const dictionaryStore = useDictionaryStore()
const showDownloader = ref(false)
const isMobile = computed(() => window.innerWidth < 768)

async function clearDictionary() {
  await dictionaryStore.clearDictionary()
  Message.success('字典已清空')
}
</script>

<template>
  <div class="dictionary-manager">
    <div class="mb-6">
      <p class="mb-2 text-gray-600">
        当前词库: {{ dictionaryStore.dictionary.length }} 个单词
      </p>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3 sm:grid-cols-2">
      <!-- 导入字典 -->
      <DictionaryCard
        :icon="IconUpload"
        title="导入字典"
        description="从 JSON 文件导入"
      >
        <DictionaryUploader />
      </DictionaryCard>

      <!-- 下载字典 -->
      <DictionaryCard
        :icon="IconDownload"
        title="下载字典"
        description="从网络下载预设词库"
      >
        <a-button type="outline" size="small" @click="showDownloader = true">
          打开下载管理
        </a-button>
      </DictionaryCard>

      <!-- 清空字典 -->
      <DictionaryCard
        :icon="IconDelete"
        title="清空字典"
        description="删除所有词条"
      >
        <a-popconfirm
          content="确定要清空字典吗？此操作不可撤销。"
          @ok="clearDictionary"
        >
          <a-button
            type="outline"
            status="danger"
            size="small"
            :disabled="!dictionaryStore.dictionary.length"
          >
            清空词库
          </a-button>
        </a-popconfirm>
      </DictionaryCard>
    </div>

    <!-- 字典下载弹出框 -->
    <a-modal
      v-model:visible="showDownloader"
      title="字典下载管理"
      :footer="false"
      :mask-closable="true"
      :width="isMobile ? '95%' : '800px'"
    >
      <DictionaryDownloader @close="showDownloader = false" />
    </a-modal>
  </div>
</template>

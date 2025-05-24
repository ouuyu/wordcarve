<script setup lang="ts">
import { Message } from '@/utils/message'
import { computed, ref } from 'vue'
import { useDictionaryStore } from '../../stores/dictionaryStore'
import DictionaryCard from './DictionaryCard.vue'
import DictionaryDownloader from './DictionaryDownloader.vue'
import DictionaryUploader from './DictionaryUploader.vue'
import { Button, Modal } from '@/components/ui'

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
      <p class="mb-2 text-gray-600">
        当前词库: {{ dictionaryStore.dictionary.length }} 个单词
      </p>
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
        <Button type="outline" size="sm" @click="showDownloader = true">
          打开下载管理
        </Button>
      </DictionaryCard>

      <!-- 清空字典 -->
      <DictionaryCard
        icon="i-carbon:trash-can"
        title="清空字典"
        description="删除所有词条"
      >
        <Button
          type="outline"
          size="sm"
          :disabled="!dictionaryStore.dictionary.length"
          @click="showConfirm = true"
        >
          清空词库
        </Button>
      </DictionaryCard>
    </div>

    <!-- 字典下载弹出框 -->
    <Modal
      v-model:visible="showDownloader"
      title="字典下载管理"
      :footer="false"
      :mask-closable="true"
      :width="isMobile ? '95%' : '800px'"
    >
      <DictionaryDownloader @close="showDownloader = false" />
    </Modal>

    <!-- 确认弹窗 -->
    <Modal
      v-model:visible="showConfirm"
      title="确认操作"
      @ok="clearDictionary"
      @cancel="showConfirm = false"
    >
      <p>确定要清空字典吗？此操作不可撤销。</p>
    </Modal>
  </div>
</template>

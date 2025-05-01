<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { IconDownload } from '@arco-design/web-vue/es/icon'
import { reactive, ref } from 'vue'
import { useDictionaryStore } from '../../stores/dictionaryStore'

const emit = defineEmits(['close'])
const dictionaryStore = useDictionaryStore()
const predefinedUrls = [
  {
    name: 'COCA 高频词',
    url: 'https://cdn.jsdelivr.net/gh/wordcarve/oss@latest/frq-15k.min.json',
    description: '基于 COCA 语料库的 13000+ 高频词',
  },
]

const customUrl = ref('')

const downloadStatus = reactive({
  isDownloading: false,
  currentUrl: '',
  currentName: '',
  error: null as string | null,
  speed: '0 KB/s',
  startTime: 0,
})

async function downloadDictionary(url: string, name: string) {
  if (downloadStatus.isDownloading) {
    Message.warning('已有下载任务正在进行中')
    return
  }

  downloadStatus.isDownloading = true
  downloadStatus.currentUrl = url
  downloadStatus.currentName = name
  downloadStatus.error = null
  downloadStatus.speed = '0 KB/s'
  downloadStatus.startTime = Date.now()

  try {
    const controller = new AbortController()
    const signal = controller.signal

    const response = await fetch(url, {
      signal,
      cache: 'no-cache',
    })
    if (!response.ok) {
      throw new Error(`HTTP 错误: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取响应内容')
    }

    let receivedLength = 0
    let lastUpdateTime = Date.now()
    let lastReceivedLength = 0

    const decoder = new TextDecoder('utf-8')
    let jsonText = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      receivedLength += value.length
      jsonText += decoder.decode(value, { stream: true })

      const now = Date.now()
      if (now - lastUpdateTime > 200) {
        const timeDiff = (now - lastUpdateTime) / 1000
        const byteDiff = receivedLength - lastReceivedLength
        const speedBps = byteDiff / timeDiff

        downloadStatus.speed = formatSpeed(speedBps)

        lastUpdateTime = now
        lastReceivedLength = receivedLength
      }
    }

    jsonText += decoder.decode()

    const totalTime = (Date.now() - downloadStatus.startTime) / 1000
    const averageSpeed = receivedLength / totalTime
    downloadStatus.speed = formatSpeed(averageSpeed)

    const success = await dictionaryStore.importDictionary(jsonText)

    if (success) {
      Message.success(`成功导入字典 "${name}"，共 ${dictionaryStore.dictionary.length} 个单词`)
      emit('close')
    }
    else {
      Message.error('导入失败，字典格式不正确')
    }
  }
  catch (error: any) {
    console.error('下载字典失败:', error)
    downloadStatus.error = error.message || '下载失败'
    Message.error(`下载失败: ${error.message || '未知错误'}`)
  }
  finally {
    downloadStatus.isDownloading = false
  }
}

function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond < 1024) {
    return `${bytesPerSecond.toFixed(1)} B/s`
  }
  else if (bytesPerSecond < 1024 * 1024) {
    return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`
  }
  else {
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`
  }
}

function downloadCustomUrl() {
  if (!customUrl.value.startsWith('https://')) {
    Message.warning('请输入有效的URL, 必须以 https: 开头')
    return
  }
  downloadDictionary(customUrl.value, '自定义词库')
}

function cancelDownload() {
  downloadStatus.isDownloading = false
  downloadStatus.error = '下载已取消'
  Message.info('下载已取消')
}
</script>

<template>
  <div>
    <a-modal
      v-model:visible="downloadStatus.isDownloading"
      :footer="false"
      :mask-closable="false"
      :closable="false"
      :esc-to-close="false"
      simple
      modal-class="download-modal"
    >
      <div class="flex flex-col items-center justify-center p-6">
        <a-spin :size="40" />
        <div class="mt-4 text-center">
          <div class="mb-2 text-lg font-medium">
            正在下载: {{ downloadStatus.currentName }}
          </div>
          <div class="text-md text-blue-500 font-medium">
            {{
              downloadStatus.isDownloading
                ? `速度: ${downloadStatus.speed}`
                : '/'
            }}
          </div>
        </div>
        <a-button class="mt-4" status="danger" @click="cancelDownload">
          取消下载
        </a-button>
      </div>
    </a-modal>

    <a-alert v-if="downloadStatus.error" type="error" class="mb-4">
      {{ downloadStatus.error }}
    </a-alert>

    <a-divider>预置词库</a-divider>

    <a-row :gutter="16">
      <a-col v-for="(dict, index) in predefinedUrls" :key="index" :span="12">
        <a-card class="mb-4">
          <template #title>
            {{ dict.name }}
          </template>
          <p class="mb-2 text-sm text-gray-500">
            {{ dict.description }}
          </p>
          <div class="mb-3 truncate text-xs text-gray-400">
            {{ dict.url }}
          </div>
          <a-button
            type="primary"
            size="small"
            :disabled="downloadStatus.isDownloading"
            @click="downloadDictionary(dict.url, dict.name)"
          >
            <template #icon>
              <IconDownload />
            </template>
            下载
          </a-button>
        </a-card>
      </a-col>
    </a-row>

    <a-divider>自定义URL</a-divider>

    <a-space direction="vertical" fill>
      <a-input-group>
        <a-input
          v-model="customUrl"
          placeholder="输入JSON词库URL"
          :disabled="downloadStatus.isDownloading"
        />
        <a-button
          type="primary"
          :disabled="!customUrl || downloadStatus.isDownloading"
          @click="downloadCustomUrl"
        >
          下载
        </a-button>
      </a-input-group>
      <p class="text-xs text-gray-500">
        请确保URL指向有效的JSON词库文件, 格式需与系统兼容
      </p>
    </a-space>
  </div>
</template>

<style scoped>
.download-modal :deep(.arco-modal-body) {
  padding: 0;
}
</style>

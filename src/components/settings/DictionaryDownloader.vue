<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { NButton, NInput, NModal } from 'naive-ui'
import { Message } from '@/utils/message'
import { useDictionaryStore } from '../../stores/dictionaryStore'

const emit = defineEmits(['close'])
const dictionaryStore = useDictionaryStore()
const isMobile = computed(() => window.innerWidth < 768)

const predefinedUrls = [
  {
    name: '词刻词典 (10k)',
    url: 'https://cdn.jsdelivr.net/gh/wordcarve/oss@latest/10k.min.json',
    description: '基于语料库词频统计的 10000 高频词',
  },
  {
    name: '词刻词典 (25k)',
    url: 'https://cdn.jsdelivr.net/gh/wordcarve/oss@latest/30k.min.json',
    description: '基于语料库词频统计的 25000 高频词',
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
    } else {
      Message.error('导入失败，字典格式不正确')
    }
  } catch (error: any) {
    console.error('下载字典失败:', error)
    downloadStatus.error = error.message || '下载失败'
    Message.error(`下载失败: ${error.message || '未知错误'}`)
  } finally {
    downloadStatus.isDownloading = false
  }
}

function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond < 1024) {
    return `${bytesPerSecond.toFixed(1)} B/s`
  } else if (bytesPerSecond < 1024 * 1024) {
    return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`
  } else {
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
  <div class="p-4">
    <!-- 下载进度模态框 -->
    <NModal
      v-model:show="downloadStatus.isDownloading"
      title="下载进度"
      preset="card"
      :mask-closable="false"
      :style="{ width: isMobile ? '95%' : '500px' }"
    >
      <div class="flex flex-col items-center justify-center p-6">
        <div class="i-svg-spinners:270-ring-with-bg h-10 w-10 text-blue-500" />
        <div class="mt-4 text-center">
          <div class="mb-2 text-lg font-medium">正在下载: {{ downloadStatus.currentName }}</div>
          <div class="text-md text-blue-500 font-medium">
            {{ downloadStatus.isDownloading ? `速度: ${downloadStatus.speed}` : '/' }}
          </div>
        </div>
        <NButton
          class="mt-4"
          type="error"
          @click="cancelDownload"
        >
          取消下载
        </NButton>
      </div>
    </NModal>

    <div
      v-if="downloadStatus.error"
      class="mb-4 border border-red-200 rounded bg-red-50 p-3 text-red-700"
    >
      {{ downloadStatus.error }}
    </div>

    <div class="my-4 border-t border-gray-200 pt-4">
      <h3 class="mb-4 text-center text-gray-600">预置词库</h3>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div
        v-for="(dict, index) in predefinedUrls"
        :key="index"
        class="mb-4"
      >
        <div class="border rounded-md bg-white p-4">
          <h4 class="mb-2 text-lg font-medium">
            {{ dict.name }}
          </h4>
          <p class="mb-2 text-sm text-gray-500">
            {{ dict.description }}
          </p>
          <div class="mb-3 break-all text-xs text-gray-400">
            {{ dict.url }}
          </div>
          <NButton
            type="primary"
            size="small"
            :disabled="downloadStatus.isDownloading"
            @click="downloadDictionary(dict.url, dict.name)"
          >
            <template #icon>
              <div class="i-carbon:download"></div>
            </template>
            下载
          </NButton>
        </div>
      </div>
    </div>

    <div class="my-4 border-t border-gray-200 pt-4">
      <h3 class="mb-4 text-center text-gray-600">自定义URL</h3>
    </div>

    <div class="flex flex-col space-y-4">
      <div class="flex space-x-2">
        <NInput
          v-model:value="customUrl"
          placeholder="输入JSON词库URL"
          :disabled="downloadStatus.isDownloading"
          class="flex-grow"
        />
        <NButton
          type="primary"
          :disabled="!customUrl || downloadStatus.isDownloading"
          @click="downloadCustomUrl"
        >
          下载
        </NButton>
      </div>
      <p class="text-xs text-gray-500">请确保URL指向有效的JSON词库文件, 格式需与系统兼容</p>
    </div>
  </div>
</template>

<style scoped>
.download-modal :deep(.arco-modal-body) {
  padding: 0;
}
</style>

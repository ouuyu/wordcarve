<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { IconDelete, IconDownload, IconUpload } from '@arco-design/web-vue/es/icon'
import { ref } from 'vue'
import { useDictionaryStore } from '../../stores/dictionaryStore'

const dictionaryStore = useDictionaryStore()
const uploading = ref(false)

async function handleFileUpload(options: any) {
  uploading.value = true
  const fileObj = options.file || (options.fileItem && options.fileItem.file)

  if (!fileObj) {
    console.error('No file found in upload options', options)
    Message.error('无法获取上传文件，请重试')
    options.onError && options.onError(new Error('无法获取上传文件'))
    uploading.value = false
    return
  }

  const reader = new FileReader()

  reader.onload = async (e) => {
    try {
      if (e.target?.result) {
        const result = e.target.result as string
        console.log('读取到文件内容，准备导入')
        const success = await dictionaryStore.importDictionary(result)

        if (success) {
          Message.success(`成功导入字典，共 ${dictionaryStore.dictionary.length} 个单词`)
          options.onSuccess && options.onSuccess()
        }
        else {
          console.error('Import failed: Invalid dictionary format')
          Message.error('导入失败，字典格式不正确')
          options.onError && options.onError(new Error('字典格式不正确'))
        }
      }
    }
    catch (error) {
      console.error('Import error:', error)
      Message.error('导入字典时出错')
      options.onError && options.onError(error)
    }
    finally {
      uploading.value = false
    }
  }

  reader.onerror = (event) => {
    console.error('FileReader error:', event)
    Message.error('读取文件时出错')
    uploading.value = false
    options.onError && options.onError(new Error('读取文件时出错'))
  }

  try {
    reader.readAsText(fileObj)
  }
  catch (error) {
    console.error('Error calling readAsText:', error)
    Message.error('文件读取错误')
    uploading.value = false
    options.onError && options.onError(error)
  }
}

function exportDictionary() {
  try {
    if (dictionaryStore.dictionary.length === 0) {
      Message.warning('字典为空，无法导出')
      return
    }
    
    const dictData = JSON.stringify(dictionaryStore.dictionary, null, 2)
    const blob = new Blob([dictData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `wordcarve-dictionary-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    Message.success('字典导出成功')
  }
  catch (error) {
    console.error('Export error:', error)
    Message.error('导出字典时出错')
  }
}

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

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <!-- Import Dictionary -->
      <div class="flex flex-col items-center rounded-lg border border-gray-100 bg-gray-50/50 p-4 transition-all">
        <div class="mb-2 text-lg text-gray-700">
          <IconUpload />
        </div>
        <h3 class="mb-2 text-center font-medium">
          导入字典
        </h3>
        <p class="mb-4 text-center text-sm text-gray-500">
          从 JSON 文件导入
        </p>
        <a-upload
          action="/"
          accept=".json"
          :auto-upload="true"
          :show-file-list="false"
          :custom-request="handleFileUpload"
          :loading="uploading"
        >
          <a-button type="outline" size="small">
            选择文件
          </a-button>
        </a-upload>
      </div>

      <!-- Export Dictionary -->
      <div class="flex flex-col items-center rounded-lg border border-gray-100 bg-gray-50/50 p-4 transition-all">
        <div class="mb-2 text-lg text-gray-700">
          <IconDownload />
        </div>
        <h3 class="mb-2 text-center font-medium">
          导出字典
        </h3>
        <p class="mb-4 text-center text-sm text-gray-500">
          保存为 JSON 文件
        </p>
        <a-button 
          type="outline" 
          size="small"
          :disabled="!dictionaryStore.dictionary.length"
          @click="exportDictionary"
        >
          导出词库
        </a-button>
      </div>

      <!-- Clear Dictionary -->
      <div class="flex flex-col items-center rounded-lg border border-gray-100 bg-gray-50/50 p-4 transition-all">
        <div class="mb-2 text-lg text-gray-700">
          <IconDelete />
        </div>
        <h3 class="mb-2 text-center font-medium">
          清空字典
        </h3>
        <p class="mb-4 text-center text-sm text-gray-500">
          删除所有词条
        </p>
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
      </div>
    </div>
  </div>
</template>

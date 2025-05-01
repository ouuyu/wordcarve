<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
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
</script>

<template>
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
</template>

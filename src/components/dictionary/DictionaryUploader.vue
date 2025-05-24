<script setup lang="ts">
import { Message } from '@/utils/message'
import { ref } from 'vue'
import { useDictionaryStore } from '../../stores/dictionaryStore'
import { Button } from '@/components/ui'

const dictionaryStore = useDictionaryStore()
const uploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

function triggerFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

async function handleFileUpload(event: Event) {
  const inputElement = event.target as HTMLInputElement
  const files = inputElement.files
  
  if (!files || files.length === 0) {
    Message.error('请选择文件')
    return
  }
  
  const fileObj = files[0]
  uploading.value = true

  try {
    const text = await readFileAsText(fileObj)
    const success = await dictionaryStore.importDictionary(text)

    if (success) {
      Message.success(`成功导入字典，共 ${dictionaryStore.dictionary.length} 个单词`)
    } else {
      console.error('Import failed: Invalid dictionary format')
      Message.error('导入失败，字典格式不正确')
    }
  } catch (error) {
    console.error('Import error:', error)
    Message.error('导入字典时出错')
  } finally {
    uploading.value = false
    // 重置文件输入，允许再次选择相同文件
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string)
      } else {
        reject(new Error('读取文件结果为空'))
      }
    }
    
    reader.onerror = (event) => {
      console.error('FileReader error:', event)
      reject(new Error('读取文件时出错'))
    }
    
    try {
      reader.readAsText(file)
    } catch (error) {
      reject(error)
    }
  })
}
</script>

<template>
  <div>
    <input
      ref="fileInputRef"
      type="file"
      accept=".json"
      class="hidden"
      @change="handleFileUpload"
    />
    <Button 
      type="outline" 
      size="sm" 
      :loading="uploading" 
      :disabled="uploading"
      @click="triggerFileInput"
      icon="carbon:upload"
    >
      选择文件
    </Button>
  </div>
</template>

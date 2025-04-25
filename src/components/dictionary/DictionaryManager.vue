<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { IconDelete, IconDownload, IconSettings, IconUpload } from '@arco-design/web-vue/es/icon'
import { ref } from 'vue'
import { useDictionaryStore } from '../../stores/dictionaryStore'

const dictionaryStore = useDictionaryStore()
const uploading = ref(false)
const showModal = ref(false)

function handleFileUpload(options: any) {
  uploading.value = true
  // 获取文件对象，在Arco中可能是options.file或options.fileItem.file
  const fileObj = options.file || (options.fileItem && options.fileItem.file)

  if (!fileObj) {
    console.error('No file found in upload options', options)
    Message.error('无法获取上传文件，请重试')
    options.onError && options.onError(new Error('无法获取上传文件'))
    uploading.value = false
    return
  }

  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      if (e.target?.result) {
        const result = e.target.result as string
        const success = dictionaryStore.importDictionary(result)

        if (success) {
          dictionaryStore.saveDictionary()
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

function clearDictionary() {
  dictionaryStore.clearDictionary()
  Message.success('字典已清空')
}

function openModal() {
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}
</script>

<template>
  <div class="dictionary-manager">
    <a-button type="outline" @click="openModal">
      <template #icon>
        <IconSettings />
      </template>
      字典管理
    </a-button>

    <a-modal
      v-model:visible="showModal"
      title="字典管理"
      :mask-closable="false"
      :footer="false"
      width="500px"
    >
      <div class="flex flex-col gap-4">
        <div>
          <h3 class="text-md mb-2 font-bold">
            导入字典
          </h3>
          <p class="mb-4 text-sm text-gray-500">
            导入 JSON 格式的字典文件
          </p>

          <a-upload
            :custom-request="handleFileUpload"
            :limit="1"
            :multiple="false"
            accept=".json"
            :show-file-list="false"
          >
            <a-button type="primary" :loading="uploading">
              <template #icon>
                <IconUpload />
              </template>
              选择字典文件
            </a-button>
          </a-upload>
        </div>

        <a-divider />

        <div>
          <h3 class="text-md mb-2 font-bold">
            当前字典状态
          </h3>
          <div class="text-sm">
            <p>已加载单词数量: <span class="font-bold">{{ dictionaryStore.dictionary.length }}</span></p>
          </div>

          <div class="mt-4 flex gap-4">
            <a-button
              :disabled="!dictionaryStore.dictionary.length"
              @click="exportDictionary"
            >
              <template #icon>
                <IconDownload />
              </template>
              导出字典
            </a-button>

            <a-popconfirm
              content="确定要清空当前字典吗？此操作不可撤销。"
              type="warning"
              @ok="clearDictionary"
            >
              <a-button
                status="danger"
                :disabled="!dictionaryStore.dictionary.length"
              >
                <template #icon>
                  <IconDelete />
                </template>
                清空字典
              </a-button>
            </a-popconfirm>
          </div>
        </div>
      </div>

      <template #footer>
        <a-button @click="closeModal">
          关闭
        </a-button>
      </template>
    </a-modal>
  </div>
</template>

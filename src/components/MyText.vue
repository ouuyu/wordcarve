<script setup lang="ts">
import type { DictionaryEntry } from '@/types'
import { useDictionaryStore } from '@/stores/dictionaryStore'
import { Doption as ADoption, Dropdown as ADropdown, Popover as APopover, Spin as ASpin, Message } from '@arco-design/web-vue'
import { computed, nextTick, onMounted, ref } from 'vue'

const dictionaryStore = useDictionaryStore()
const componentRoot = ref<HTMLDivElement | null>(null)
const rawText = ref('')

function updateRawText() {
  if (componentRoot.value) {
    rawText.value = componentRoot.value.textContent?.trim() ?? ''
  }
}

onMounted(() => {
  nextTick(updateRawText)
})

const words = computed(() => {
  return rawText.value.match(/[\w'-]+|[^\w\s'-]+/g) || []
})

const popoverVisible = ref(false)
const currentWord = ref<string | null>(null)
const currentWordInfo = ref<DictionaryEntry | null>(null)
const popoverTarget = ref<EventTarget | null>(null)
const popoverLoading = ref(false)
const activePopoverId = ref<string | null>(null) // 用于控制具体哪个 Popover 显示

async function handleWordClick(event: MouseEvent, word: string, id: string) {
  if (!/^[a-z'-]+$/i.test(word)) {
    return
  }
  window.getSelection()?.removeAllRanges()

  if (activePopoverId.value === id && popoverVisible.value) {
    popoverVisible.value = false
    activePopoverId.value = null
    return
  }

  currentWord.value = word.toLowerCase()
  popoverTarget.value = event.currentTarget
  popoverLoading.value = true
  currentWordInfo.value = null
  activePopoverId.value = id
  popoverVisible.value = true

  try {
    if (!dictionaryStore.dictionary.length) {
      await dictionaryStore.loadDictionary()
    }
    currentWordInfo.value = dictionaryStore.searchWord(currentWord.value)
    if (!currentWordInfo.value) {
      Message.info(`未找到单词 "${word}" 的释义`)
      // 找不到也保持打开状态，显示提示
    }
  }
  catch (error) {
    console.error('查词失败:', error)
    Message.error('查词时出错')
    popoverVisible.value = false
    activePopoverId.value = null
  }
  finally {
    popoverLoading.value = false
  }
}

function handlePopoverVisibleChange(visible: boolean, id: string) {
  if (!visible && activePopoverId.value === id) {
    setTimeout(() => {
      if (activePopoverId.value === id) {
        popoverVisible.value = false
        activePopoverId.value = null
        currentWord.value = null
        popoverTarget.value = null
        currentWordInfo.value = null
      }
    }, 150)
  }
}

const dropdownVisible = ref(false)
const selectedText = ref('')
const dropdownPosition = ref({ x: 0, y: 0 })

function handleMouseUp(event: MouseEvent) {
  const targetElement = event.target as HTMLElement
  if (targetElement.closest('.arco-popover') || targetElement.closest('.arco-dropdown')) {
    return
  }

  if (popoverVisible.value) {
    return
  }

  const selection = window.getSelection()
  const text = selection?.toString().trim() ?? ''

  if (text && text.length > 0) {
    selectedText.value = text
    dropdownPosition.value = { x: event.clientX, y: event.clientY }
    dropdownVisible.value = true
  }
  else {
    dropdownVisible.value = false
  }
}

function handleContextMenu(event: MouseEvent) {
  event.preventDefault()
}

function handleDropdownSelect(option: string | number | Record<string, any> | undefined) {
  Message.info(`选择了 "${option}"，文本: "${selectedText.value}"`)
  dropdownVisible.value = false // 关闭菜单
}
</script>

<template>
  <div
    ref="componentRoot"
    class="my-text-component interactive-text leading-relaxed"
    @mouseup="handleMouseUp"
    @contextmenu="handleContextMenu"
  >
    <div style="display: none;">
      <slot />
    </div>

    <template v-if="rawText">
      <template v-for="(word, index) in words" :key="index">
        <APopover
          v-if="/^[a-zA-Z'-]+$/.test(word)"
          :popup-visible="activePopoverId === `word-${index}` && popoverVisible"
          position="top"
          trigger="click"
          :popup-container="`#word-span-${index}`"
          :arrow-style="{ display: 'none' }"
          :content-style="{ padding: '8px 12px', minWidth: '200px', maxWidth: '300px' }"
          @popup-visible-change="(vis: boolean) => handlePopoverVisibleChange(vis, `word-${index}`)"
        >
          <span
            :id="`word-span-${index}`"
            class="word-token cursor-pointer rounded px-0.5 transition-colors duration-150 hover:bg-arcoblue-2"
            @click.stop="handleWordClick($event, word, `word-${index}`)"
          >
            {{ word }}
          </span>
          <template #content>
            <div v-if="popoverLoading" class="p-2 text-center">
              <ASpin size="small" /> 查询中...
            </div>
            <div v-else-if="currentWordInfo" class="word-definition">
              <div class="mb-1 text-base font-bold">
                {{ currentWordInfo.word }}
                <span v-if="currentWordInfo.phonetic" class="ml-2 text-sm text-gray-500 font-normal">/{{ currentWordInfo.phonetic }}/</span>
              </div>
              <ul class="list-disc list-inside text-sm">
                <li v-for="(def, i) in currentWordInfo.translation" :key="i">
                  {{ def }}
                </li>
              </ul>
            </div>
            <div v-else class="p-2 text-gray-500">
              未找到释义
            </div>
          </template>
        </APopover>
        <span v-else>{{ word }}</span>{{ index < words.length - 1 ? '' : '' }}
      </template>
    </template>
    <template v-else />

    <!-- 自定义右键菜单 -->
    <ADropdown
      v-model:popup-visible="dropdownVisible"
      trigger="contextMenu"
      align-point
      :style="{ left: `${dropdownPosition.x}px`, top: `${dropdownPosition.y}px` }"
      @select="handleDropdownSelect"
    >
      <!-- 这个 div 用于触发 alignPoint 定位 -->
      <div :style="{ position: 'fixed', left: `${dropdownPosition.x}px`, top: `${dropdownPosition.y}px`, width: 0, height: 0 }" />
      <template #content>
        <ADoption value="copy">
          复制
        </ADoption>
        <ADoption value="search">
          搜索 "{{ selectedText.length > 15 ? `${selectedText.slice(0, 15)}...` : selectedText }}"
        </ADoption>
        <ADoption value="add_vocab">
          添加到生词本
        </ADoption>
      </template>
    </ADropdown>
  </div>
</template>

<style scoped>
.word-token {
  display: inline-block; /* 确保 Popover 定位正确 */
  position: relative; /* 用于 Popover 容器定位 */
}
.word-definition ul {
  padding-left: 1.2em;
  margin: 0;
}
.word-definition li {
  margin-bottom: 2px;
}
</style>

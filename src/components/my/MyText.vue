<script setup lang="ts">
import type { DictionaryEntry } from '@/types'
import MyPopover from '@/components/my/MyPopover.vue'
import { useDictionaryStore } from '@/stores/dictionaryStore'
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'

const props = defineProps<{ text: string }>()
const emit = defineEmits<{
  (e: 'navigate', word: string): void
}>()

const dictionaryStore = useDictionaryStore()
const componentRoot = ref<HTMLDivElement | null>(null)
const rawText = ref(props.text)

// 状态管理
const state = reactive({
  popover: {
    visible: false,
    loading: false,
    currentWord: null as string | null,
    wordInfo: null as DictionaryEntry | null,
    targetElement: null as HTMLElement | null,
    clickedWordIndex: null as number | null,
  },
})

// 重置弹窗状态
function resetPopoverState() {
  state.popover.visible = false
  state.popover.loading = false
  state.popover.currentWord = null
  state.popover.wordInfo = null
  state.popover.targetElement = null
  state.popover.clickedWordIndex = null
}

// 全局事件名称
const CLOSE_POPOVERS_EVENT = 'close-popovers'

// 处理其他实例关闭弹窗事件
function handleClosePopovers(event: CustomEvent) {
  if (event.detail.instanceId !== instanceId) {
    resetPopoverState()
  }
}

// 生成唯一实例ID
const instanceId = Math.random().toString(36).substr(2, 9)

// 分发关闭其他弹窗事件
function dispatchClosePopovers() {
  window.dispatchEvent(
    new CustomEvent(CLOSE_POPOVERS_EVENT, { detail: { instanceId } }),
  )
}

// 处理全局点击
function handleGlobalClick(event: MouseEvent) {
  if (componentRoot.value && !componentRoot.value.contains(event.target as Node)) {
    resetPopoverState()
  }
}

// 监听全局事件
onMounted(() => {
  window.addEventListener(CLOSE_POPOVERS_EVENT, handleClosePopovers as EventListener)
  document.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
  window.removeEventListener(CLOSE_POPOVERS_EVENT, handleClosePopovers as EventListener)
  document.removeEventListener('click', handleGlobalClick)
  resetPopoverState()
})

// 监听文本变化
watch(
  () => props.text,
  async (newValue) => {
    rawText.value = newValue
    await nextTick()
    resetPopoverState()
  },
  { immediate: true },
)

// 分词
const words = computed(() => {
  return rawText.value.match(/[\w'-]+|[^\w\s'-]+/g) || []
})

// 处理单词点击
async function handleWordClick(event: MouseEvent, word: string, index: number) {
  // 只处理英文单词
  if (!/^[a-z'-]+$/i.test(word)) {
    if (state.popover.visible)
      resetPopoverState()
    return
  }

  const clickedElement = event.currentTarget as HTMLElement

  // 如果点击的是当前打开的单词，则关闭弹窗
  if (state.popover.targetElement === clickedElement && state.popover.visible) {
    resetPopoverState()
    return
  }

  // 关闭其他实例的弹窗
  dispatchClosePopovers()

  // 重置当前状态
  resetPopoverState()
  await nextTick()

  // 设置新状态
  state.popover.currentWord = word.toLowerCase()
  state.popover.targetElement = clickedElement
  state.popover.clickedWordIndex = index
  state.popover.loading = true
  state.popover.visible = true

  try {
    // 确保字典已加载
    if (!dictionaryStore.dictionary.length) {
      await dictionaryStore.loadDictionary()
    }
    // 查询单词
    state.popover.wordInfo = dictionaryStore.searchWord(state.popover.currentWord)
  }
  catch (error) {
    console.error('查词失败:', error)
    resetPopoverState()
  }
  finally {
    state.popover.loading = false
  }
}

// 处理鼠标抬起事件（用于文本选择）
function handleMouseUp(event: MouseEvent) {
  const targetElement = event.target as HTMLElement
  if (targetElement.closest('.arco-dropdown'))
    return

  const selection = window.getSelection()
  const text = selection?.toString().trim() ?? ''
  if (text && text.length > 0 && state.popover.visible) {
    resetPopoverState()
  }
}

// 禁用右键菜单
function handleContextMenu(event: MouseEvent) {
  event.preventDefault()
}

// 监听空文本
watch(rawText, (newText) => {
  if (!newText || newText.trim() === '') {
    resetPopoverState()
  }
})
</script>

<template>
  <div
    ref="componentRoot"
    :key="rawText"
    class="my-text-component interactive-text leading-relaxed"
    @mouseup="handleMouseUp"
    @contextmenu="handleContextMenu"
  >
    <template v-if="rawText">
      <template v-for="(word, index) in words" :key="`${word}-${index}`">
        <span
          v-if="/^[a-zA-Z'-]+$/.test(word)"
          class="word-token cursor-pointer rounded px-0.5 transition-colors duration-150 hover:bg-arcoblue-2"
          :class="[{ 'bg-arcoblue-1': state.popover.clickedWordIndex === index && state.popover.visible }]"
          @click.stop="handleWordClick($event, word, index)"
        >
          {{ word }}
        </span>
        <span v-else>{{ word }}</span>
      </template>
    </template>

    <MyPopover
      :visible="state.popover.visible"
      :target="state.popover.targetElement"
      :word="state.popover.currentWord"
      :offset="8"
      @navigate="word => emit('navigate', word)"
    >
      <template #content>
        <div v-if="state.popover.loading" class="flex items-center justify-center p-3">
          <div class="spinner" />
          <span class="ml-2 text-gray-600">查询中...</span>
        </div>
        <div v-else-if="state.popover.wordInfo" class="word-definition">
          <div class="mb-2 flex items-center justify-between">
            <div class="text-lg text-gray-800 font-bold">
              {{ state.popover.wordInfo.word }}
            </div>
            <div v-if="state.popover.wordInfo.phonetic" class="text-sm text-gray-500">
              /{{ state.popover.wordInfo.phonetic }}/
            </div>
          </div>
          <div class="space-y-2">
            <div
              v-for="(trans, idx) in state.popover.wordInfo.translation"
              :key="idx"
              class="text-sm text-gray-600"
            >
              {{ trans }}
            </div>
          </div>
        </div>
        <div v-else class="p-3 text-gray-600">
          未找到该单词
        </div>
      </template>
    </MyPopover>
  </div>
</template>

<style scoped>
.my-text-component {
  position: relative;
}

.word-token {
  position: relative;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

<script setup lang="ts">
import type { DictionaryEntry } from '@/types'
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import MyPopover from '@/components/my/MyPopover.vue'
import { useDictionaryStore } from '@/stores/dictionaryStore'

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

const CLOSE_POPOVERS_EVENT = 'close-popovers'

const instanceId = Math.random().toString(36).substr(2, 9)

function handleClosePopovers(event: CustomEvent) {
  if (event.detail.instanceId !== instanceId) {
    resetPopoverState()
  }
}

function dispatchClosePopovers() {
  window.dispatchEvent(
    new CustomEvent(CLOSE_POPOVERS_EVENT, { detail: { instanceId } }),
  )
}

function handleGlobalClick(event: MouseEvent) {
  if (componentRoot.value && !componentRoot.value.contains(event.target as Node)) {
    resetPopoverState()
  }
}

onMounted(() => {
  window.addEventListener(CLOSE_POPOVERS_EVENT, handleClosePopovers as EventListener)
  document.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
  window.removeEventListener(CLOSE_POPOVERS_EVENT, handleClosePopovers as EventListener)
  document.removeEventListener('click', handleGlobalClick)
  resetPopoverState()
})

watch(
  () => props.text,
  async (newValue) => {
    rawText.value = newValue
    await nextTick()
    resetPopoverState()
  },
  { immediate: true },
)

const words = computed(() => {
  return rawText.value.match(/[\w'-]+|[^\w\s'-]+/g) || []
})

async function handleWordClick(event: MouseEvent, word: string, index: number) {
  if (!/^[a-z'-]+$/i.test(word)) {
    if (state.popover.visible)
      resetPopoverState()
    return
  }

  const clickedElement = event.currentTarget as HTMLElement

  if (state.popover.targetElement === clickedElement && state.popover.visible) {
    resetPopoverState()
    return
  }

  dispatchClosePopovers()

  resetPopoverState()
  await nextTick()

  state.popover.currentWord = word.toLowerCase()
  state.popover.targetElement = clickedElement
  state.popover.clickedWordIndex = index
  state.popover.loading = true
  state.popover.visible = true

  try {
    if (!dictionaryStore.dictionary.length) {
      await dictionaryStore.loadDictionary()
    }
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

function handleContextMenu(event: MouseEvent) {
  event.preventDefault()
}

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
    class="interactive-text my-text-component leading-relaxed"
    @mouseup="handleMouseUp"
    @contextmenu="handleContextMenu"
  >
    <template v-if="rawText">
      <template v-for="(word, index) in words" :key="`${word}-${index}`">
        <span
          v-if="/^[a-zA-Z'-]+$/.test(word)"
          class="word-token hover:bg-theme-2 cursor-pointer rounded px-0.5 transition-colors duration-150"
          :class="[{ 'bg-theme-1': state.popover.clickedWordIndex === index && state.popover.visible }]"
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>

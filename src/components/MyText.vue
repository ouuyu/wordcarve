<script setup lang="ts">
import type { DictionaryEntry } from '@/types'
import MyPopover from '@/components/MyPopover.vue'
import { useDictionaryStore } from '@/stores/dictionaryStore'
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'

const props = defineProps<{ text: string }>()

// Generate a unique id for this MyText instance
const instanceId = Math.random().toString(36).substr(2, 9)

const dictionaryStore = useDictionaryStore()
const componentRoot = ref<HTMLDivElement | null>(null)

const rawText = ref(props.text)

// State for popover (word definition)
const popoverState = reactive({
  visible: false,
  loading: false,
  currentWord: null as string | null,
  wordInfo: null as DictionaryEntry | null,
  targetElement: null as HTMLElement | null,
  clickedWordIndex: null as number | null,
})

// Method to reset popover state
function resetPopoverState() {
  popoverState.visible = false
  popoverState.loading = false
  popoverState.currentWord = null
  popoverState.wordInfo = null
  popoverState.targetElement = null
  popoverState.clickedWordIndex = null
}

// Global event name for closing popovers
const CLOSE_POPOVERS_EVENT = 'close-popovers'

// When another MyText instance opens its popover, close this popover if it's open.
function handleClosePopovers(event: CustomEvent) {
  if (event.detail.instanceId !== instanceId) {
    resetPopoverState()
  }
}

// Dispatch event to close popovers on other instances
function dispatchClosePopovers() {
  window.dispatchEvent(
    new CustomEvent(CLOSE_POPOVERS_EVENT, { detail: { instanceId } }),
  )
}

// Listen to global close event
onMounted(() => {
  window.addEventListener(CLOSE_POPOVERS_EVENT, handleClosePopovers as EventListener)
})
onUnmounted(() => {
  window.removeEventListener(CLOSE_POPOVERS_EVENT, handleClosePopovers as EventListener)
  resetPopoverState()
})

// Watch for props.text changes and reset popover after DOM update
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
    if (popoverState.visible)
      resetPopoverState()
    return
  }

  // Before opening a popover, dispatch an event to close any open popovers in other MyText instances.
  dispatchClosePopovers()

  const clickedElement = event.currentTarget as HTMLElement

  if (popoverState.targetElement === clickedElement && popoverState.visible) {
    resetPopoverState()
    await new Promise(resolve => setTimeout(resolve, 20))
  }
  else if (popoverState.visible) {
    resetPopoverState()
    await new Promise(resolve => setTimeout(resolve, 20))
  }

  popoverState.currentWord = word.toLowerCase()
  popoverState.targetElement = clickedElement
  popoverState.clickedWordIndex = index
  popoverState.loading = true
  popoverState.visible = true
  popoverState.wordInfo = null

  try {
    if (!dictionaryStore.dictionary.length) {
      await dictionaryStore.loadDictionary()
    }
    popoverState.wordInfo = dictionaryStore.searchWord(popoverState.currentWord)
  }
  catch (error) {
    console.error('查词失败:', error)
    resetPopoverState()
  }
  finally {
    popoverState.loading = false
  }
}

function handleMouseUp(event: MouseEvent) {
  const targetElement = event.target as HTMLElement

  if (targetElement.closest('.arco-dropdown')) {
    return
  }

  const selection = window.getSelection()
  const text = selection?.toString().trim() ?? ''

  if (text && text.length > 0) {
    if (popoverState.visible)
      resetPopoverState()
    // Context menu logic can be added similarly if needed
  }
}

function handleContextMenu(event: MouseEvent) {
  event.preventDefault()
}

onUnmounted(() => {
  resetPopoverState()
})

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
          :class="[{ 'bg-arcoblue-1 bg-arcoblue-2': popoverState.clickedWordIndex === index && popoverState.visible }]"
          @click.stop="handleWordClick($event, word, index)"
        >
          {{ word }}
        </span>
        <span v-else>{{ word }}</span>
      </template>
    </template>

    <MyPopover
      :visible="popoverState.visible"
      :target="popoverState.targetElement"
      :offset="8"
    >
      <template #content>
        <div v-if="popoverState.loading" class="flex items-center justify-center p-3">
          <div class="spinner" />
          <span class="ml-2 text-gray-600">查询中...</span>
        </div>
        <div v-else-if="popoverState.wordInfo" class="word-definition">
          <div class="mb-2 flex items-center justify-between">
            <div class="text-lg text-gray-800 font-bold">
              {{ popoverState.wordInfo.word }}
            </div>
            <div v-if="popoverState.wordInfo.phonetic" class="text-sm text-gray-500">
              /{{ popoverState.wordInfo.phonetic }}/
            </div>
          </div>
          <div class="space-y-2">
            <div
              v-for="(trans, idx) in popoverState.wordInfo.translation"
              :key="idx"
              class="text-sm text-gray-600"
            >
              {{ trans }}
            </div>
          </div>
        </div>
        <div v-else class="p-3 text-center text-gray-500">
          未找到释义
        </div>
      </template>
    </MyPopover>
  </div>
</template>

<style scoped>
.word-token {
  display: inline-block;
}

.word-definition {
  max-height: 300px;
  overflow-y: auto;
}

@media (max-width: 640px) {
  .my-popover {
    max-width: 95vw;
  }
}
</style>

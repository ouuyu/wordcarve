<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  target: {
    type: Object as () => HTMLElement | null,
    default: null,
  },
  offset: {
    type: Number,
    default: 8,
  },
  word: {
    type: String,
    default: '',
  },
  dictionaries: {
    type: Array as () => Array<{
      name: string
      url: string
      icon?: string
    }>,
    default: () => [
      {
        name: '剑桥词典',
        url: 'https://dictionary.cambridge.org/dictionary/english/',
        icon: 'i-carbon-book',
      },
      {
        name: '有道词典',
        url: 'https://dict.youdao.com/result?word=',
        icon: 'i-carbon-translate',
      },
      {
        name: '柯林斯词典',
        url: 'https://www.collinsdictionary.com/dictionary/english/',
        icon: 'i-carbon-dictionary',
      },
    ],
  },
})

const _emit = defineEmits<{
  (e: 'navigate', word: string): void
}>()

const router = useRouter()

const popoverRef = ref<HTMLElement | null>(null)
const position = ref({ top: 0, left: 0 })

// 跟踪动画帧
let animationFrame: number | null = null
// ResizeObserver 实例
let resizeObserver: ResizeObserver | null = null
// MutationObserver 实例
let mutationObserver: MutationObserver | null = null

function calculatePosition() {
  if (!props.target || !popoverRef.value)
    return

  const targetRect = props.target.getBoundingClientRect()
  const popoverRect = popoverRef.value.getBoundingClientRect()
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

  // 计算基础位置（目标元素下方）
  let top = targetRect.bottom + props.offset + scrollTop
  let left = targetRect.left + scrollLeft

  // 右边界检测
  const rightEdge = left + popoverRect.width
  const viewportWidth = window.innerWidth + scrollLeft
  if (rightEdge > viewportWidth) {
    left = Math.max(scrollLeft + 8, viewportWidth - popoverRect.width - 8)
  }

  // 下边界检测
  const bottomEdge = top + popoverRect.height
  const viewportHeight = window.innerHeight + scrollTop
  if (bottomEdge > viewportHeight) {
    // 放到目标元素上方
    top = targetRect.top - popoverRect.height - props.offset + scrollTop
    if (top < scrollTop)
      top = scrollTop + 8
  }

  position.value = { top, left }
}

// 使用 requestAnimationFrame 优化性能
function updatePosition() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  animationFrame = requestAnimationFrame(() => {
    calculatePosition()
  })
}

// 设置观察器
function setupObservers() {
  if (!props.target)
    return

  // 创建 ResizeObserver
  if (!resizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      if (props.visible)
        updatePosition()
    })
  }

  // 创建 MutationObserver
  if (!mutationObserver) {
    mutationObserver = new MutationObserver(() => {
      if (props.visible)
        updatePosition()
    })
  }

  // 观察目标元素
  resizeObserver.observe(props.target)
  mutationObserver.observe(props.target, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
  })

  // 观察父元素的变化
  let parent = props.target.parentElement
  while (parent) {
    resizeObserver.observe(parent)
    mutationObserver.observe(parent, {
      attributes: true,
      childList: true,
      characterData: true,
    })
    parent = parent.parentElement
  }
}

// 清理观察器
function cleanupObservers() {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  if (mutationObserver) {
    mutationObserver.disconnect()
  }
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
}

// 监听可见性变化
watch(() => props.visible, (visible) => {
  if (visible) {
    nextTick(() => {
      calculatePosition()
      setupObservers()
    })
  }
  else {
    cleanupObservers()
  }
})

// 监听目标元素变化
watch(() => props.target, () => {
  cleanupObservers()
  if (props.visible) {
    nextTick(() => {
      calculatePosition()
      setupObservers()
    })
  }
})

// 监听弹窗内容变化
watch(popoverRef, () => {
  if (props.visible) {
    nextTick(() => {
      calculatePosition()
    })
  }
})

// 监听滚动和窗口大小变化
onMounted(() => {
  window.addEventListener('scroll', updatePosition, true)
  window.addEventListener('resize', updatePosition)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
  cleanupObservers()
})

const popoverStyle = computed<CSSProperties>(() => ({
  position: 'absolute',
  top: `${position.value.top}px`,
  left: `${position.value.left}px`,
  zIndex: 999,
}))

// 跳转到词刻搜索页
function navigateToSearch() {
  if (!props.word)
    return
  router.push(`/search?q=${encodeURIComponent(props.word)}`)
}

// 处理字典跳转
function _handleDictClick(dictionary: { url: string, name: string }) {
  const url = `${dictionary.url}${props.word}`
  window.open(url, '_blank')
}
</script>

<template>
  <Transition name="popover-fade">
    <Teleport v-if="visible" to="body">
      <div ref="popoverRef" :style="popoverStyle" class="my-popover">
        <div class="my-popover-content">
          <slot name="content" />
        </div>
        <div class="my-popover-footer">
          <button class="search-btn" @click="navigateToSearch">
            <div i-carbon-search class="icon" />
            <span>查看更多释义</span>
          </button>
        </div>
      </div>
    </Teleport>
  </Transition>
</template>

<style scoped>
.my-popover {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 12px 16px;
  max-width: 300px;
  min-width: 200px;
  width: max-content;
}

.my-popover-content {
  margin-bottom: 8px;
}

.my-popover-footer {
  border-top: 1px solid #e5e7eb;
  margin: 0 -16px;
  padding: 12px 16px 0;
}

.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 8px 12px;
  color: #1d4ed8;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.2s;
  cursor: pointer;
  background: #f0f7ff;
  border: none;
  outline: none;
  font-weight: 500;
}

.search-btn:hover {
  background: #e0f2fe;
}

.search-btn .icon {
  margin-right: 8px;
  font-size: 16px;
}

.popover-fade-enter-active,
.popover-fade-leave-active {
  transition: opacity 0.2s ease;
}

.popover-fade-enter-from,
.popover-fade-leave-to {
  opacity: 0;
}
</style>

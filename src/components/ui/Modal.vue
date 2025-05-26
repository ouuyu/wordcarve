<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Button from './Button.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  width: {
    type: [String, Number],
    default: '500px',
  },
  maskClosable: {
    type: Boolean,
    default: true,
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
  okText: {
    type: String,
    default: '确定',
  },
  cancelText: {
    type: String,
    default: '取消',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:visible', 'ok', 'cancel'])

const modalRef = ref<HTMLElement | null>(null)

// 计算样式
const modalStyle = computed(() => {
  const style: Record<string, string> = {}

  if (typeof props.width === 'number') {
    style.width = `${props.width}px`
  }
  else {
    style.width = props.width
  }

  return style
})

// 关闭模态框
function close() {
  emit('update:visible', false)
}

// 点击遮罩层关闭
function handleMaskClick() {
  if (props.maskClosable) {
    close()
  }
}

// 点击确定
function handleOk() {
  emit('ok')
}

// 点击取消
function handleCancel() {
  emit('cancel')
  close()
}

// 阻止冒泡
function stopPropagation(e: Event) {
  e.stopPropagation()
}

// 处理 ESC 键关闭
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.visible) {
    close()
  }
}

// 添加/移除全局事件监听
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 控制滚动锁定
watch(() => props.visible, (visible) => {
  if (visible) {
    document.body.classList.add('overflow-hidden')
  }
  else {
    document.body.classList.remove('overflow-hidden')
  }
})

// 确保在关闭后重置内部状态
watch(() => props.visible, (visible) => {
  if (!visible) {
    nextTick(() => {
      // 这里可以重置内部状态
    })
  }
})
</script>

<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center"
        @click="handleMaskClick"
      >
        <!-- 遮罩层 -->
        <div class="absolute inset-0 bg-black bg-opacity-50" />

        <!-- 模态框内容 -->
        <div
          ref="modalRef"
          class="relative z-10 max-h-90vh overflow-auto rounded-md bg-white shadow-lg"
          :style="modalStyle"
          @click="stopPropagation"
        >
          <!-- 标题栏 -->
          <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h3 class="text-lg font-medium">
              {{ title }}
            </h3>
            <button
              class="text-gray-500 hover:text-gray-700 focus:outline-none"
              @click="close"
            >
              <span class="i-carbon:close h-5 w-5" />
            </button>
          </div>

          <!-- 内容区域 -->
          <div class="p-4">
            <slot />
          </div>

          <!-- 底部按钮区域 -->
          <div
            v-if="showFooter"
            class="flex justify-end border-t border-gray-200 px-4 py-3 space-x-2"
          >
            <slot name="footer">
              <Button @click="handleCancel">
                {{ cancelText }}
              </Button>
              <Button type="primary" :loading="loading" @click="handleOk">
                {{ okText }}
              </Button>
            </slot>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.max-h-90vh {
  max-height: 90vh;
}

/* 遮罩层 */
.fixed.inset-0 .absolute.inset-0 {
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(1px);
}

/* 模态框内容 */
.relative.z-10 {
  border-radius: var(--border-radius-large);
  background-color: var(--color-bg);
  box-shadow: var(--shadow-hover);
  color: var(--color-text-primary);
  transition: var(--transition-all);
  min-width: 300px;
}

/* 标题栏 */
.relative.z-10>div:first-child {
  border-bottom: 1px solid var(--color-border-lighter);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.relative.z-10>div:first-child h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.relative.z-10>div:first-child button {
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: var(--transition-all);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-small);
}

.relative.z-10>div:first-child button:hover {
  background-color: var(--color-bg-light);
  color: var(--color-text-primary);
}

/* 内容区域 */
.relative.z-10>div:nth-child(2) {
  padding: 20px;
  line-height: 1.5;
  color: var(--color-text-regular);
}

/* 底部按钮区域 */
.relative.z-10>div:nth-child(3) {
  padding: 16px 20px;
  border-top: 1px solid var(--color-border-lighter);
  background-color: var(--color-bg-lighter);
  border-bottom-left-radius: var(--border-radius-large);
  border-bottom-right-radius: var(--border-radius-large);
}
</style>

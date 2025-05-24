import { createVNode, h, render, ref, onMounted, onBeforeUnmount, Transition } from 'vue'

interface MessageOptions {
  content: string
  duration?: number
  type?: 'info' | 'success' | 'warning' | 'error'
}

// 消息组件
const MessageComponent = {
  name: 'Message',
  props: {
    content: String,
    type: String,
    duration: {
      type: Number,
      default: 3000,
    },
  },
  setup(props: any, { expose }: any) {
    const visible = ref(true)
    let timer: number | null = null

    onMounted(() => {
      timer = window.setTimeout(() => {
        visible.value = false
      }, props.duration)
    })

    onBeforeUnmount(() => {
      if (timer) clearTimeout(timer)
    })

    expose({
      close: () => {
        visible.value = false
      },
    })

    return () => {
      const typeClass = {
        info: 'bg-blue-50 border-blue-200 text-blue-700',
        success: 'bg-green-50 border-green-200 text-green-700',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        error: 'bg-red-50 border-red-200 text-red-700',
      }[props.type as string] || 'bg-gray-50 border-gray-200 text-gray-700'

      return visible.value 
        ? h(Transition, { name: 'message-fade' }, {
            default: () => h('div', {
              class: `fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded border ${typeClass} shadow-sm z-50`
            }, props.content)
          })
        : null
    }
  },
}

// 创建消息实例
function createMessage(options: MessageOptions) {
  const container = document.createElement('div')
  const vm = createVNode(MessageComponent, {
    content: options.content,
    type: options.type || 'info',
    duration: options.duration || 3000,
  })
  
  render(vm, container)
  document.body.appendChild(container)
  
  // 销毁消息
  const destroy = () => {
    render(null, container)
    container.remove()
  }
  
  // 添加过渡效果结束监听
  const el = container.firstElementChild
  if (el) {
    el.addEventListener('transitionend', () => {
      if (!(vm.component?.exposed as any)?.visible) {
        destroy()
      }
    })
  }
  
  return {
    close: () => {
      (vm.component?.exposed as any)?.close()
    },
  }
}

// 创建消息API
export const Message = {
  info(content: string, duration = 3000) {
    return createMessage({ content, type: 'info', duration })
  },
  success(content: string, duration = 3000) {
    return createMessage({ content, type: 'success', duration })
  },
  warning(content: string, duration = 3000) {
    return createMessage({ content, type: 'warning', duration })
  },
  error(content: string, duration = 3000) {
    return createMessage({ content, type: 'error', duration })
  },
}

// 添加全局样式
const style = document.createElement('style')
style.textContent = `
.message-fade-enter-active,
.message-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.message-fade-enter-from,
.message-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
`
document.head.appendChild(style) 
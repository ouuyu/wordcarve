<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  direction: {
    type: String as () => 'horizontal' | 'vertical',
    default: 'horizontal',
    validator: (val: string) => ['horizontal', 'vertical'].includes(val)
  },
  size: {
    type: [Number, String],
    default: 'medium',
    validator: (val: number | string) => {
      if (typeof val === 'number') return val >= 0
      return ['small', 'medium', 'large'].includes(val)
    }
  },
  fill: {
    type: Boolean,
    default: false
  },
  align: {
    type: String as () => 'start' | 'end' | 'center' | 'baseline',
    default: 'center',
    validator: (val: string) => ['start', 'end', 'center', 'baseline'].includes(val)
  },
  wrap: {
    type: Boolean,
    default: false
  }
})

// 转换 size 为具体的像素值
const sizeMap = {
  small: 8,
  medium: 16,
  large: 24
}

// 计算容器样式
const containerStyle = computed(() => {
  const style: Record<string, string> = {}
  const size = typeof props.size === 'number' 
    ? props.size 
    : sizeMap[props.size as keyof typeof sizeMap] || sizeMap.medium
  
  if (props.direction === 'horizontal') {
    style.columnGap = `${size}px`
    style.rowGap = props.wrap ? `${size}px` : '0'
  } else {
    style.rowGap = `${size}px`
  }
  
  return style
})

// 计算容器类名
const containerClass = computed(() => {
  const classes = ['space']
  
  // 方向
  classes.push(`space-${props.direction}`)
  
  // 对齐方式
  if (props.align) {
    classes.push(`items-${props.align === 'start' ? 'start' : props.align === 'end' ? 'end' : props.align}`)
  }
  
  // 填充
  if (props.fill) {
    classes.push('w-full')
  }
  
  // 换行
  if (props.wrap) {
    classes.push('flex-wrap')
  }
  
  return classes.join(' ')
})
</script>

<template>
  <div :class="containerClass" :style="containerStyle">
    <slot></slot>
  </div>
</template>

<style scoped>
.space {
  display: flex;
}

.space-horizontal {
  flex-direction: row;
}

.space-vertical {
  flex-direction: column;
}

/* 使组件支持暗色主题，但不直接定义颜色 */
:deep(.space > *) {
  transition: var(--transition-all);
}
</style> 
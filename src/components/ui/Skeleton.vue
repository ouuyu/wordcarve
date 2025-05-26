<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: true,
  },
  animation: {
    type: Boolean,
    default: true,
  },
  count: {
    type: Number,
    default: 1,
  },
  height: {
    type: String,
    default: '',
  },
  width: {
    type: String,
    default: '100%',
  },
  circle: {
    type: Boolean,
    default: false,
  },
})

// 生成骨架项的数组
const skeletonItems = computed(() => {
  return Array.from({ length: props.count }, (_, i) => i)
})

// 骨架屏样式
const skeletonStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width) {
    style.width = props.width
  }
  if (props.height) {
    style.height = props.height
  }
  if (props.circle) {
    style.borderRadius = '50%'
  }
  return style
})

// 骨架屏类名
const skeletonClass = computed(() => {
  const classes = ['skeleton-item']
  if (props.animation) {
    classes.push('skeleton-animation')
  }
  if (props.circle) {
    classes.push('rounded-full')
  }
  else {
    classes.push('rounded')
  }
  return classes.join(' ')
})
</script>

<template>
  <div v-if="loading" class="skeleton">
    <slot v-if="$slots.default" />
    <template v-else>
      <div
        v-for="index in skeletonItems"
        :key="index"
        :style="skeletonStyle"
        :class="skeletonClass"
      />
    </template>
  </div>
  <div v-else>
    <slot />
  </div>
</template>

<style scoped>
.skeleton {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-item {
  background-color: var(--color-bg-light);
  height: 16px;
  position: relative;
  overflow: hidden;
}

.skeleton-animation {
  position: relative;
}

.skeleton-animation::after {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(90deg,
      rgba(255, 255, 255, 0) 0,
      rgba(255, 255, 255, 0.2) 20%,
      rgba(255, 255, 255, 0.5) 60%,
      rgba(255, 255, 255, 0));
  animation: shimmer 2s infinite;
  content: '';
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.rounded {
  border-radius: var(--border-radius-base);
}

.rounded-full {
  border-radius: 50%;
}
</style>

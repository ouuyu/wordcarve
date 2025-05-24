<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  rows: {
    type: Number,
    default: 1
  },
  width: {
    type: Array as () => Array<string>,
    default: () => ['100%']
  },
  animation: {
    type: Boolean,
    default: true
  }
})

// 获取每行宽度，如果 width 数组长度小于 rows，则后续行使用 100%
const getRowWidth = (index: number) => {
  if (index < props.width.length) {
    return props.width[index]
  }
  return '100%'
}

// 生成行数组
const lineItems = computed(() => {
  return Array.from({ length: props.rows }, (_, i) => i)
})
</script>

<template>
  <div class="skeleton-line">
    <div
      v-for="index in lineItems"
      :key="index"
      class="skeleton-line-item"
      :class="{ 'skeleton-animation': animation }"
      :style="{ width: getRowWidth(index) }"
    />
  </div>
</template>

<style scoped>
.skeleton-line {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line-item {
  height: 16px;
  background-color: var(--color-bg-light);
  border-radius: var(--border-radius-base);
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
</style> 
<script setup lang="ts">
import { NTooltip, NProgress } from 'naive-ui'

defineProps<{
  level: number
}>()

// 根据等级返回颜色
function getLevelColor(level: number) {
  switch (level) {
    case 1:
      return '#d03050'
    case 2:
      return '#f0883a'
    case 3:
      return '#fccc75'
    case 4:
      return '#8bbf43'
    case 5:
      return '#18a058'
    default:
      return '#d9d9d9'
  }
}

// 根据等级返回文本描述
function getLevelDesc(level: number) {
  switch (level) {
    case 1:
      return '非常罕见'
    case 2:
      return '较为罕见'
    case 3:
      return '一般常见'
    case 4:
      return '较为常见'
    case 5:
      return '非常常见'
    default:
      return '未知频率'
  }
}
</script>

<template>
  <NTooltip>
    <template #trigger>
      <div class="frequency-indicator">
        <div class="signal-bars">
          <div
            v-for="i in 5"
            :key="i"
            class="bar"
            :class="{ active: i <= level }"
            :style="{ backgroundColor: i <= level ? getLevelColor(level) : '#e0e0e0' }"
          />
        </div>
      </div>
    </template>
    <div class="flex flex-col items-center">
      <span>词频等级：{{ level }}/5</span>
      <span class="text-xs mt-1">{{ getLevelDesc(level) }}</span>
      <NProgress
        :percentage="level * 20"
        :color="getLevelColor(level)"
        :height="4"
        :show-indicator="false"
        :border-radius="4"
        class="mt-2 w-20"
      />
    </div>
  </NTooltip>
</template>

<style scoped>
.frequency-indicator {
  display: inline-flex;
  align-items: flex-end;
  height: 16px;
  width: 18px;
  position: relative;
}

.signal-bars {
  display: flex;
  align-items: flex-end;
  height: 100%;
  width: 100%;
  gap: 1px;
}

.bar {
  flex: 1;
  border-radius: 1px;
  transition: background-color 0.2s ease;
}

.bar:nth-child(1) {
  height: 20%;
}
.bar:nth-child(2) {
  height: 40%;
}
.bar:nth-child(3) {
  height: 60%;
}
.bar:nth-child(4) {
  height: 80%;
}
.bar:nth-child(5) {
  height: 100%;
}
</style>

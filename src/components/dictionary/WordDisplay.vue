<script setup lang="ts">
import type { DictionaryEntry } from '../../types'
import { Message } from '@arco-design/web-vue'
import { ref } from 'vue'
import { playWordPronunciation, PronunciationType } from '../../utils/audio'

const props = defineProps<{
  word: DictionaryEntry
}>()

// 导航项
const navItems = [
  { id: 'dictionary', label: '词典释义' },
  { id: 'examples', label: '例句' },
  { id: 'usage', label: '用法' },
  { id: 'wiki', label: '百科' },
]

// 当前活动的导航项
const activeNav = ref('dictionary')

// 切换导航项
function setActiveNav(navId: string) {
  activeNav.value = navId
}

// 标签映射
const tagMapping: Record<string, string> = {
  zk: '中考',
  gk: '高考',
  cet4: '四级',
  cet6: '六级',
  ky: '考研',
  toefl: '托福',
  ielts: '雅思',
  gre: 'GRE',
}

// 获取标签显示文本
function getTagDisplay(tag: string): string {
  return tagMapping[tag] || tag
}

// 添加发音功能
async function playPronunciation(type: PronunciationType) {
  try {
    await playWordPronunciation(props.word.word, type)
  }
  catch {
    Message.error('播放发音失败')
  }
}
</script>

<template>
  <div class="w-full flex flex-col items-start md:flex-row">
    <!-- PC端左侧导航栏 -->
    <div class="sticky top-4 hidden w-48 flex-col gap-2 md:flex">
      <div
        v-for="item in navItems"
        :key="item.id"
        class="flex cursor-pointer items-center justify-between rounded px-4 py-2 transition-colors"
        :class="activeNav === item.id ? 'text-arcoblue-6 bg-arcoblue-1 font-medium' : 'text-gray-500 hover:text-arcoblue-6 hover:bg-arcoblue-1/50'"
        @click="setActiveNav(item.id)"
      >
        <span>{{ item.label }}</span>
        <span class="text-gray-400">·</span>
      </div>
    </div>

    <!-- 移动端顶部导航栏 -->
    <div class="w-full overflow-x-auto md:hidden">
      <div class="flex gap-2 pb-2">
        <div
          v-for="item in navItems"
          :key="item.id"
          class="cursor-pointer whitespace-nowrap rounded px-4 py-2 transition-colors"
          :class="activeNav === item.id ? 'text-arcoblue-6 bg-arcoblue-1 font-medium' : 'text-gray-500 hover:text-arcoblue-6 hover:bg-arcoblue-1/50'"
          @click="setActiveNav(item.id)"
        >
          {{ item.label }}
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="w-full overflow-x-hidden md:ml-8">
      <div class="mb-4 flex items-center justify-between">
        <div class="flex flex-wrap items-center gap-4">
          <h1 class="break-all text-3xl font-bold">
            {{ word.word }}
          </h1>
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-gray-600">/{{ word.phonetic }}/</span>
            <div class="flex gap-2">
              <a-button type="text" size="mini" @click="playPronunciation(PronunciationType.US)">
                美
              </a-button>
              <a-button type="text" size="mini" @click="playPronunciation(PronunciationType.UK)">
                英
              </a-button>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-6 flex flex-wrap gap-2">
        <span
          v-for="tag in word.tag || []"
          :key="tag"
          class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
        >
          {{ getTagDisplay(tag) }}
        </span>
        <span v-if="word.collins" class="rounded-full bg-arcoblue-2 px-3 py-1 text-sm text-arcoblue-7">
          柯林斯 {{ word.collins }}星
        </span>
      </div>

      <!-- 内容区域 - 根据当前选中的导航项显示不同内容 -->
      <div v-if="activeNav === 'dictionary'">
        <!-- 直接显示所有翻译 -->
        <div class="mb-6">
          <div v-for="(trans, index) in word.translation" :key="index" class="mb-2 text-gray-700">
            {{ trans }}
          </div>
        </div>

        <!-- 词形变化 -->
        <div v-if="word.exchange" class="mb-6">
          <div class="mb-2 text-gray-500">
            词形变化
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div v-if="word.exchange.s" class="font-medium">
              <span class="text-sm text-gray-500">复数: </span>
              {{ word.exchange.s }}
            </div>
            <div v-if="word.exchange.p" class="font-medium">
              <span class="text-sm text-gray-500">过去式: </span>
              {{ word.exchange.p }}
            </div>
            <div v-if="word.exchange.d" class="font-medium">
              <span class="text-sm text-gray-500">过去分词: </span>
              {{ word.exchange.d }}
            </div>
            <div v-if="word.exchange.i" class="font-medium">
              <span class="text-sm text-gray-500">现在分词: </span>
              {{ word.exchange.i }}
            </div>
            <div v-if="word.exchange['3']" class="font-medium">
              <span class="text-sm text-gray-500">第三人称单数: </span>
              {{ word.exchange['3'] }}
            </div>
            <div v-if="word.exchange.r" class="font-medium">
              <span class="text-sm text-gray-500">比较级: </span>
              {{ word.exchange.r }}
            </div>
            <div v-if="word.exchange.t" class="font-medium">
              <span class="text-sm text-gray-500">最高级: </span>
              {{ word.exchange.t }}
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeNav === 'examples'">
        <!-- 例句内容 -->
        <div class="text-gray-700">
          <p class="mb-4 text-gray-500">
            暂无例句数据
          </p>
        </div>
      </div>

      <div v-else-if="activeNav === 'usage'">
        <!-- 用法内容 -->
        <div class="text-gray-700">
          <p class="mb-4 text-gray-500">
            暂无用法数据
          </p>
        </div>
      </div>

      <div v-else-if="activeNav === 'wiki'">
        <!-- 百科内容 -->
        <div class="text-gray-700">
          <p class="mb-4 text-gray-500">
            暂无百科数据
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.break-all {
  word-break: break-all;
}
.word-display-card {
  backdrop-filter: blur(10px);
}
</style>

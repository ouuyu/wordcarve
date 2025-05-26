<script setup lang="ts">
import type { DailyQuote } from '@/utils/quote'
import { onMounted, ref } from 'vue'
import { getDailyQuote } from '@/utils/quote'

const quote = ref<DailyQuote | null>(null)

onMounted(async () => {
  try {
    quote.value = await getDailyQuote()
  }
  catch (error) {
    console.error('获取每日一言失败:', error)
  }
})
</script>

<template>
  <div class="flex items-center justify-center p-4">
    <div v-if="quote" class="max-w-2xl w-full">
      <div class="transform rounded-lg bg-white p-8 shadow-md transition-all duration-300 hover:shadow-lg">
        <!-- 英文内容 -->
        <p class="mb-4 text-2xl text-gray-800 leading-relaxed font-serif">
          "{{ quote.content }}"
        </p>

        <!-- 中文翻译 -->
        <p class="mb-6 text-lg text-gray-600">
          {{ quote.translation }}
        </p>

        <!-- 作者和来源 -->
        <div class="text-right">
          <p class="text-gray-700 italic">
            —— {{ quote.author }}
          </p>
          <p class="mt-1 text-sm text-gray-500">
            {{ quote.origin }}
          </p>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="animate-pulse text-gray-600">
      加载中...
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@/utils/message' // 假设 Message 工具用于显示提示

const router = useRouter()

onMounted(() => {
  Message.info('词库为空, 将在2秒后自动跳转到设置页面导入词库...')
  setTimeout(() => {
    router.push('/settings')
  }, 2000)
})
</script>

<template>
  <div class="empty-dictionary-redirect my-8 w-full flex flex-col items-center justify-center p-4">
    <div class="flex flex-col items-center justify-center gap-3">
      <div class="text-theme-5 i-carbon-book mb-2 h-14 w-14" />
      <h2 class="text-xl text-gray-800 font-bold">
        词库为空
      </h2>
      <p class="text-gray-600">
        请先导入词库后再使用单词本功能
      </p>
      <p class="mt-2 text-sm text-gray-400">
        2秒后将自动跳转到设置页面…
      </p>
    </div>
  </div>
</template>

<style scoped>
.empty-dictionary-redirect {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

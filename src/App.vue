<script setup lang="ts">
import { onMounted } from 'vue'
import MyFloatingMenu from '@/components/my/MyFloatingMenu.vue'
import { useDictionaryStore } from './stores/dictionaryStore'

const dictionaryStore = useDictionaryStore()

onMounted(async () => {
  try {
    const result = await dictionaryStore.loadDictionary()
    console.warn(
      `字典数据加载${result ? '成功' : '失败'}，共 ${dictionaryStore.dictionary.length} 个单词`,
    )
  } catch (error) {
    console.error('加载字典数据失败:', error)
  }
})
</script>

<template>
  <div class="bg-theme-1 min-h-screen flex flex-col">
    <!-- 主区域 -->
    <main class="mx-auto max-w-1200px w-full flex-1 p-8">
      <transition name="slide">
        <router-view />
      </transition>
    </main>
    <MyFloatingMenu />
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.35s ease-out;
  position: relative;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>

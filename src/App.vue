<script setup lang="ts">
import { IconSettings, IconUser } from '@arco-design/web-vue/es/icon'
import { onMounted } from 'vue'
import { useDictionaryStore } from './stores/dictionaryStore'

const dictionaryStore = useDictionaryStore()

const navItems = [
  { path: '/', label: '首页' },
  { path: '/search', label: '搜索' },
]

onMounted(async () => {
  try {
    const result = await dictionaryStore.loadDictionary()
    console.warn(`字典数据加载${result ? '成功' : '失败'}，共 ${dictionaryStore.dictionary.length} 个单词`)
  }
  catch (error) {
    console.error('加载字典数据失败:', error)
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-arcoblue-1">
    <!-- 顶栏 -->
    <header class="h-16 flex items-center justify-between bg-arcoblue-1 px-8 shadow-sm">
      <div class="flex items-center text-6 font-bold">
        词刻
      </div>
      <nav class="flex gap-10">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="link">
          {{ item.label }}
        </router-link>
      </nav>
      <div class="flex items-center gap-4">
        <router-link to="/settings" class="flex items-center">
          <IconSettings class="text-xl" />
        </router-link>
        <a-avatar class="cursor-pointer bg-arcoblue-3">
          <template #icon>
            <IconUser class="text-white" />
          </template>
        </a-avatar>
      </div>
    </header>

    <!-- 主区域 -->
    <main class="mx-auto max-w-1200px w-full flex-1 p-8">
      <router-view />
    </main>

    <!-- 底栏 -->
    <footer class="mt-auto bg-arcoblue-4 px-8 py-6">
      <div class="mx-auto max-w-1200px flex items-center justify-between">
        <p>
          © 2025 词刻 WordCarve. 保留所有权利.
        </p>
        <div class="flex gap-6">
          <a href="/about" class="link">关于我们</a>
          <a href="/privacy" class="link">隐私政策</a>
          <a href="/contact" class="link">联系我们</a>
        </div>
      </div>
    </footer>
  </div>
</template>

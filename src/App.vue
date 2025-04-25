<script setup lang="ts">
import { IconUser } from '@arco-design/web-vue/es/icon'

const navItems = [
  { path: '/', label: '首页' },
  { path: '/search', label: '搜索' },
]
</script>

<template>
  <div class="bg-arcoblue-1 min-h-screen flex flex-col">
    <!-- 顶栏 -->
    <header class="bg-arcoblue-1 h-16 flex items-center justify-between px-8 shadow-sm">
      <div class="flex items-center text-6 font-bold">
        词刻
      </div>
      <nav class="flex gap-10">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="link"
        >
          {{ item.label }}
        </router-link>
      </nav>
      <div class="cursor-pointer">
        <a-avatar class="bg-arcoblue-3">
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
    <footer class="bg-arcoblue-4 mt-auto px-8 py-6">
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

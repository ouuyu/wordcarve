<script setup lang="ts">
import { IconApps, IconMoon, IconSun, IconUser } from '@arco-design/web-vue/es/icon'
import { ref, watchEffect } from 'vue'

const isDark = ref(localStorage.getItem('theme') === 'dark')

watchEffect(() => {
  document.body.setAttribute('arco-theme', isDark.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
})

function toggleTheme() {
  isDark.value = !isDark.value
}
</script>

<template>
  <div :class="isDark ? 'bg-dark-900' : 'bg-gray-100'">
    <a-layout class="transition-theme h-screen w-screen overflow-hidden">
      <a-layout-header class="transition-theme flex items-center justify-between px-6">
        <div class="text-xl font-bold">
          词刻
        </div>
        <div class="flex items-center">
          <a-menu mode="horizontal" :default-selected-keys="['1']">
            <a-menu-item key="1">
              <template #icon>
                <IconApps />
              </template>
              首页
            </a-menu-item>
            <a-menu-item key="2">
              <template #icon>
                <IconUser />
              </template>
              我的
            </a-menu-item>
          </a-menu>
          <a-button type="text" class="ml-4" @click="toggleTheme">
            <template #icon>
              <IconMoon v-if="!isDark" />
              <IconSun v-else />
            </template>
          </a-button>
        </div>
      </a-layout-header>
      <a-layout-content class="m-2 flex-1 overflow-auto">
        <router-view class="transition-theme h-full" />
      </a-layout-content>
      <a-layout-footer class="transition-theme h-6 justify-center text-center">
        词刻 ©2025
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>

<style scoped>
.dark-mode {
  background-color: #17171a;
  color: white;
}

.dark-mode .arco-menu-dark .arco-menu-item {
  color: rgba(255, 255, 255, 0.7);
}

.dark-mode .arco-menu-dark .arco-menu-item.arco-menu-selected {
  color: white;
}
</style>
